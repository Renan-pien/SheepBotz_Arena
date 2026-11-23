"""O Core compila o fonte. Só a árvore validada da estratégia recebe capacidades."""
import ast
import functools
import io
import json
import math
import operator
import tempfile
from contextlib import redirect_stdout
from pathlib import Path

import machine
from meuPia.compiler import main as compile_portugol
from meupia_maker.plugin_iot import iot_configurar_pino, iot_ligar, iot_desligar


PUBLIC = frozenset("""
definir_velocidade ler_laser ler_laser_central ler_contato ler_borda ler_odometria
tempo_simulado largada_liberada aleatorio registrar iot_ligar iot_desligar
iot_configurar_pino len _S _escreva _faixa
""".split())
OPERATORS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul,
             ast.Div: operator.truediv, ast.Mod: operator.mod, ast.FloorDiv: operator.floordiv}
BUDGET = 4096


def invalid(reason):
    raise ValueError("Perfil Portugol da Arena: " + reason)


def checked_binary(op, left, right):
    if op == "Add" and isinstance(left, str) and isinstance(right, str):
        if len(left) + len(right) > 4096:
            invalid("limite de texto excedido.")
        return left + right
    if type(left) not in (int, float) or type(right) not in (int, float):
        invalid("a operação exige números.")
    value = OPERATORS[getattr(ast, op)](left, right)
    if isinstance(value, int) and value.bit_length() > 256:
        invalid("limite de inteiro excedido.")
    if isinstance(value, float) and not math.isfinite(value):
        invalid("resultado numérico fora do intervalo.")
    return value


def scalar_list(*items):
    if len(items) > 1024 or any(type(item) not in (str, int, bool, float) for item in items):
        invalid("use uma lista de até 1024 valores escalares.")
    if sum(len(item) for item in items if isinstance(item, str)) > 4096:
        invalid("limite de texto da lista excedido.")
    return list(items)


def bounded_text(value):
    text = str(value)
    if len(text) > 4096:
        invalid("limite de texto excedido.")
    return text


def inclusive_range(start, end, step):
    if not step:
        invalid("o passo do laço não pode ser zero.")
    return range(start, end + (1 if step > 0 else -1), step)


def identifier(name):
    if name.startswith("_") or name in PUBLIC or not name.isidentifier():
        invalid("nome reservado: " + name)
    return name


class Profile(ast.NodeTransformer):
    """Toda construção nova do compilador precisa de autorização explícita."""
    allowed = (ast.Module, ast.Assign, ast.Expr, ast.If, ast.Return, ast.Pass,
               ast.Break, ast.Continue, ast.BoolOp, ast.And, ast.Or, ast.UnaryOp,
               ast.Not, ast.USub, ast.UAdd, ast.Compare, ast.Eq, ast.NotEq,
               ast.Lt, ast.LtE, ast.Gt, ast.GtE, ast.Subscript, ast.Load,
               ast.List, ast.arguments, ast.arg, ast.Store)

    def __init__(self, functions):
        self.functions = functions

    def generic_visit(self, node):
        if not isinstance(node, self.allowed):
            invalid("construção indisponível: " + type(node).__name__)
        return super().generic_visit(node)

    def visit_Constant(self, node):
        value = node.value
        if type(value) not in (int, float, bool, str, type(None)):
            invalid("literal indisponível.")
        if type(value) is int and value.bit_length() > 256:
            invalid("inteiro fora do intervalo.")
        if type(value) is float and not math.isfinite(value):
            invalid("real fora do intervalo.")
        if type(value) is str and len(value) > 4096:
            invalid("texto longo demais.")
        return node

    def visit_Name(self, node):
        identifier(node.id)
        if node.id in self.functions:
            invalid("funções só podem ser usadas em chamadas.")
        return node

    def visit_Global(self, node):
        for name in node.names:
            identifier(name)
            if name in self.functions:
                invalid("atribuição a uma função.")
        return node

    def visit_Assign(self, node):
        if len(node.targets) != 1 or not isinstance(node.targets[0], ast.Name):
            invalid("atribua a uma variável.")
        return self.generic_visit(node)

    def visit_Call(self, node):
        if not isinstance(node.func, ast.Name) or node.keywords:
            invalid("use uma função do tutorial ou da estratégia.")
        name = node.func.id
        if name not in PUBLIC and name not in self.functions:
            invalid("comando indisponível: " + name)
        node.args = [self.visit(arg) for arg in node.args]
        return node

    def visit_List(self, node):
        return ast.copy_location(ast.Call(ast.Name("_items", ast.Load()),
            [self.visit(item) for item in node.elts], []), node)

    def visit_BinOp(self, node):
        if type(node.op) not in OPERATORS:
            invalid("operador aritmético indisponível.")
        return ast.copy_location(ast.Call(ast.Name("_binary", ast.Load()),
            [ast.Constant(type(node.op).__name__), self.visit(node.left), self.visit(node.right)], []), node)

    def metered(self, node):
        super().generic_visit(node)
        node.body.insert(0, ast.Expr(ast.Call(ast.Name("_check", ast.Load()), [], [])))
        return node

    def visit_FunctionDef(self, node):
        args = node.args
        if node.decorator_list or args.defaults or args.kwonlyargs or args.vararg or args.kwarg or node.returns:
            invalid("assinatura de função indisponível.")
        for arg in args.args:
            identifier(arg.arg)
            if arg.annotation or arg.arg in self.functions:
                invalid("parâmetro de função inválido.")
        return self.metered(node)

    def visit_While(self, node):
        return self.metered(node)

    def visit_For(self, node):
        if not isinstance(node.target, ast.Name) or not isinstance(node.iter, ast.Call) or not isinstance(node.iter.func, ast.Name) or node.iter.func.id != "_faixa":
            invalid("use para com limites numéricos.")
        return self.metered(node)


@functools.lru_cache(maxsize=12)
def compile_strategy(source):
    if len(source.encode("utf-8")) > 32768:
        invalid("o arquivo excede 32 KiB.")
    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder, "robo.por")
        path.write_text(source, encoding="utf-8")
        output = io.StringIO()
        with redirect_stdout(output):
            result = compile_portugol(str(path), folder)
        if result:
            raise ValueError(output.getvalue().split("[COMPILATION ERROR]:")[-1].strip()[-1200:])
        tree = ast.parse(path.with_suffix(".py").read_text(encoding="utf-8"))
    # Só descartar o prólogo do compilador. Nenhuma importação gerada é executada.
    imports = [i for i, child in enumerate(tree.body) if isinstance(child, ast.Try)]
    if len(imports) != 1:
        invalid('declare apenas usar "maker".')
    header = tree.body[imports[0]].body
    if len(header) != 1 or not isinstance(header[0], ast.ImportFrom) or header[0].module != "meupia_maker.plugin_iot":
        invalid('declare usar "maker".')
    body = tree.body[imports[0] + 1:]
    footer = ast.parse("if __name__ == '__main__': main()").body[0]
    if not body or ast.dump(body[-1]) != ast.dump(footer):
        invalid("formato de saída do compilador desconhecido.")
    tree.body = body[:-1]
    funcs = {}
    for child in tree.body:
        if isinstance(child, ast.FunctionDef):
            name = identifier(child.name)
            if name in funcs:
                invalid("nome de função repetido: " + name)
            funcs[name] = child
        elif not isinstance(child, ast.Assign):
            invalid("declaração indisponível.")
    for name in ("main", "decidir", "preparar"):
        if name == "preparar" and name not in funcs:
            continue
        if name not in funcs or funcs[name].args.args:
            invalid("declare " + name + "() sem parâmetros.")
    checked = Profile(funcs).visit(tree)
    return compile(ast.fix_missing_locations(checked), "<estratégia>", "exec")


def build_controller(source, api):
    try:
        code = compile_strategy(source)
        remaining = BUDGET

        def check():
            nonlocal remaining
            remaining -= 1
            if remaining < 0:
                invalid("limite de trabalho por tick excedido.")

        def pin_mode(pin, mode):
            if mode.upper() != "SAIDA":
                invalid('use iot_configurar_pino(2, "SAIDA").')
            iot_configurar_pino(pin, "SAIDA")

        def log(*values):
            api.log(*[value if type(value) in (str, bool, int, float) else bounded_text(value) for value in values])

        env = {"__builtins__": {}, "_check": check, "_binary": checked_binary,
               "_items": scalar_list, "_S": bounded_text, "len": len, "_escreva": log, "_faixa": inclusive_range,
               "definir_velocidade": api.speed, "ler_laser": lambda: json.loads(api.laser()),
               "ler_laser_central": api.central, "ler_contato": api.contact, "ler_borda": api.edge,
               "ler_odometria": lambda: json.loads(api.odometry()), "tempo_simulado": api.time,
               "largada_liberada": api.released, "aleatorio": api.random, "registrar": log,
               "iot_ligar": iot_ligar, "iot_desligar": iot_desligar, "iot_configurar_pino": pin_mode}
        exec(code, env)
    except Exception as error:
        return str(error)

    def invoke(initial):
        nonlocal remaining
        remaining = BUDGET
        token = machine.motor.set(api.speed)
        try:
            if initial:
                env["main"]()
                if "preparar" in env:
                    env["preparar"]()
            else:
                env["decidir"]()
        except Exception as error:
            return str(error)
        finally:
            machine.motor.reset(token)
    return invoke
