import type { ErrorCode, ValidationError } from '../types';

function error(
  code: ErrorCode,
  path: string,
  message: string,
): ValidationError {
  return { code, path, message };
}

export const errors = {
  invalidJson(detail: unknown) {
    return error(
      'ARQUIVO_INVALIDO',
      '',
      `O arquivo de mundo não é um JSON válido: ${String(detail)}.`,
    );
  },
  invalidRoot() {
    return error(
      'ARQUIVO_INVALIDO',
      '',
      'A raiz do arquivo de mundo deve ser um objeto.',
    );
  },
  required(path: string) {
    return error('CAMPO_OBRIGATORIO', path, `O campo '${path}' é obrigatório.`);
  },
  unknown(path: string) {
    return error(
      'CAMPO_DESCONHECIDO',
      path,
      `O campo '${path}' não é reconhecido.`,
    );
  },
  wrongType(path: string, type: string) {
    return error('TIPO_INVALIDO', path, `O campo '${path}' deve ser ${type}.`);
  },
  wrongFormat(path: string, rule: string) {
    return error(
      'FORMATO_INVALIDO',
      path,
      `O campo '${path}' tem formato inválido: ${rule}.`,
    );
  },
  outOfRange(path: string, interval: string, value: number) {
    return error(
      'VALOR_FORA_DO_INTERVALO',
      path,
      `O campo '${path}' está fora do intervalo permitido (${interval}); valor recebido: ${value}.`,
    );
  },
  listSize(path: string, min: number, max: number, length: number) {
    return error(
      'VALOR_FORA_DO_INTERVALO',
      path,
      `A lista '${path}' deve ter de ${min} a ${max} itens; recebidos: ${length}.`,
    );
  },
  duplicate(path: string, id: string) {
    return error(
      'ID_DUPLICADO',
      path,
      `O id '${id}' em '${path}' já foi usado.`,
    );
  },
  outsideMap(path: string, item: 'robô' | 'obstáculo') {
    return error(
      'FORA_DO_MAPA',
      path,
      `O ${item} em '${path}' não está inteiramente dentro do mapa.`,
    );
  },
  arenaOutsideMap(max: number) {
    const path = 'arena.radius';
    return error(
      'FORA_DO_MAPA',
      path,
      `A arena em '${path}' não cabe no mapa: o raio máximo é ${max}.`,
    );
  },
  overlap(path: string, item: 'robô' | 'obstáculo', id: string) {
    return error(
      'POSICAO_INICIAL_INVALIDA',
      path,
      `O robô em '${path}' começa sobrepondo o ${item} '${id}'.`,
    );
  },
  excessiveStep(path: string, displacement: number, radius: number) {
    return error(
      'DESLOCAMENTO_EXCESSIVO',
      path,
      `Em '${path}', maxLinearSpeed × dt (${displacement} m) é maior que o raio do robô (${radius} m); reduza a velocidade máxima ou o dt.`,
    );
  },
  sumoCount(count: number) {
    return error(
      'REGRA_DA_MODALIDADE',
      'robots',
      `No modo sumô, 'robots' deve ter exatamente 2 robôs; recebidos: ${count}.`,
    );
  },
  sumoArenaRequired() {
    return error(
      'REGRA_DA_MODALIDADE',
      'arena',
      "No modo sumô, o campo 'arena' é obrigatório.",
    );
  },
  sumoOutsideArena(path: string) {
    return error(
      'REGRA_DA_MODALIDADE',
      path,
      `No modo sumô, o robô em '${path}' deve começar dentro da arena.`,
    );
  },
  unknownRobot(path: string, id: string) {
    return error(
      'ROBO_INEXISTENTE',
      path,
      `Não existe robô com id '${id}' (em '${path}').`,
    );
  },
  invalidCommand(path: string) {
    return error(
      'COMANDO_INVALIDO',
      path,
      `O comando em '${path}' deve ter v e w numéricos e finitos.`,
    );
  },
};
