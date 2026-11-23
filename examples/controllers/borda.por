algoritmo "Guarda da borda"
usar "maker"

funcao decidir()
    se largada_liberada() entao
        se ler_borda("frente") entao
            definir_velocidade(-0.25, 1.5)
        senao
            iot_ligar(2)
        fim_se
    fim_se
fim_funcao

inicio
fim_algoritmo
