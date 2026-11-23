algoritmo "Desviar da parede"
usar "maker"

funcao decidir()
    se ler_laser_central() < 0.25 entao
        definir_velocidade(0, 1.5)
    senao
        iot_ligar(2)
    fim_se
fim_funcao

inicio
fim_algoritmo
