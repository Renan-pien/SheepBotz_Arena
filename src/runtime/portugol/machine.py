"""Saída digital da Arena para o módulo público meuPiá Maker."""
from contextvars import ContextVar

motor = ContextVar("motor")


class Pin:
    IN, OUT = 0, 1

    def __init__(self, number, mode=OUT):
        if type(number) is not int or number != 2 or mode != self.OUT:
            raise ValueError("O pino virtual 2 aceita somente saída.")

    def value(self, level):
        motor.get()(0.20 if level else 0, 0)
