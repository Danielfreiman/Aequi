-- Importa transacoes do JSON (Firebase) para o Supabase, criando stores e categorias faltantes.
-- Passo: substitua o bloco $$...$$ abaixo pelo array JSON completo (ex: conteudo de transactions.json).
-- Cuidado: o script limpa fin_transactions antes de inserir (ajuste se nao quiser limpar).

with
json_input as (
  -- injete o JSON via variável CONTENT (ex: psql --set=CONTENT="$(cat transactions.json)")
  select [
  {
    "type": "Despesa",
    "description": "INSS - Léo (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-20",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Compra açaí  (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 1000
      },
      {
        "description": "trste 2  (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 50
      }
    ],
    "value": 1298
  },
  {
    "date": "2025-09-19",
    "description": "INSS - Julio",
    "value": 167,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-27",
    "description": "Andinho Saco Kraft",
    "value": 45.6,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "description": "Luz Corredor",
    "value": 40,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-23",
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (9/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "value": 1600,
    "description": "Emp Daniel",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-11-10",
    "category": "Emprestimo",
    "isPaid": true,
    "type": "Receita"
  },
  {
    "date": "2025-05-30",
    "description": "Emprestimo Léo",
    "value": 1500,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-05",
    "description": "Diarias Isa Julho",
    "value": 478.06,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (10/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (29/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-22",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (6/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-05-05",
    "description": "Empréstimo 99 Leo 1/6",
    "value": 1050.62,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-20",
    "description": "Ifood",
    "value": 1577.16,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (9/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-09-20",
    "items": []
  },
  {
    "date": "2025-09-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-29",
    "description": "Boleto LF Neto",
    "value": 232.57,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-02-05",
    "description": "CCN Distribuidora",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Fatura Detalhada",
    "bankId": "EmT3wtErD97yCUdJSI14",
    "items": [
      {
        "category": "Custos (CMV/CMV)",
        "description": "Teste 3  (2/4)",
        "value": 10
      },
      {
        "description": "teste  (2/3)",
        "value": 50,
        "category": "Custos (CMV/CMV)"
      },
      {
        "description": "teste 2  (2/2)",
        "value": 40,
        "category": "Custos (CMV/CMV)"
      },
      {
        "description": "Teste (2/3)",
        "value": 10,
        "category": "Custos (CMV/CMV)"
      },
      {
        "category": "Custos (CMV/CMV)",
        "description": "Teste 2  (2/2)",
        "value": 20
      },
      {
        "description": "Teste 2  (2/2)",
        "value": 30,
        "category": "Custos (CMV/CMV)"
      },
      {
        "value": 90,
        "description": "Teste (2/2)",
        "category": "Custos (CMV/CMV)"
      },
      {
        "value": 10,
        "category": "Custos (CMV/CMV)",
        "description": "teste 2  (2/3)"
      },
      {
        "description": "dfdf (2/2)",
        "category": "Custos (CMV/CMV)",
        "value": 100
      },
      {
        "description": "dfsfdf (2/3)",
        "category": "Custos (CMV/CMV)",
        "value": 20
      }
    ],
    "value": 762.9
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (2/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (39/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-30",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "description": "Contador Açaí (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-10",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Compra açaí  (2/3)",
        "value": 1000,
        "category": "Custos (CMV/CMV)"
      },
      {
        "description": "teste 3  (2/2)",
        "category": "Custos (CMV/CMV)",
        "value": 40
      }
    ],
    "value": 1410
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (27/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-08",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-09-05"
  },
  {
    "type": "Receita",
    "description": "Ifood (2/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-14",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 7349.4,
    "isPaid": true
  },
  {
    "date": "2025-11-19",
    "description": "Pagamento PrinLab - Calendarios + Adesivos",
    "value": 275,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "description": "Pic Pay Fatura",
    "value": 4104.06,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "description": "Pró Labore - Léo",
    "value": 600,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-15"
  },
  {
    "type": "Despesa",
    "description": "Internet",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-02-24",
    "isPaid": true,
    "bankId": "zAo5QdJBtjbvIQnzhPPc",
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "teste (2/2)",
        "category": "Custos (CMV/CMV)",
        "value": 90
      },
      {
        "description": "cgvfd (2/3)",
        "category": "Custos (CMV/CMV)",
        "value": 10
      }
    ],
    "value": 200
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (9/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-09-26",
    "description": "Boleto Nestlé",
    "value": 296.93,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-10",
    "description": "Bling",
    "value": 55,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (29/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-22",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank giro 3/24",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-03",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (10/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (48/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-02",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-07-15",
    "description": "Emp. Léo",
    "value": 769,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (11/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-10-04",
    "description": "Emp.  Léo",
    "value": 7000,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (42/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-21",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-20",
    "description": "Imposto Açaí",
    "value": 417.66,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Nubank Léo Prime 1/10",
    "value": 147.29,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "description": "Emp. Bela",
    "value": 150,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-24",
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Outros",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (10/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-10-25",
    "description": "Andinho Kraft",
    "value": 56,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "description": "Diarias Isa",
    "value": 300,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-28"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Receita",
    "value": 909.51,
    "description": "Ifood",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-17",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-10-13",
    "description": "Empréstimo Vanuza",
    "value": 1400,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 444.11,
    "description": "Nubank Léo R. Quality Açaís (5/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "description": "Boleto Nestlé Maio",
    "value": 314.59,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05",
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-08-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-16",
    "description": "Emp. Léo",
    "value": 300,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-22",
    "description": "Emp. Léo",
    "value": 170,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-09-02",
    "description": "Pix Boys Somas:",
    "value": 38,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 13.82,
    "description": "Desconto Atencipação Pagamento Giro Nubank",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-26",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (22/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-03",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (1/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Contabilidade e outros serviços",
    "isPaid": true,
    "date": "2025-12-10"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (1/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (34/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-26",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 146,
    "description": "Pagamento Emprestimo Isa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-24",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (32/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-12",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (17/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-29",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-07-02",
    "description": "Ifood",
    "value": 2191.31,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-05-30",
    "description": "Diarias Isa",
    "value": 300,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-07",
    "description": "Ifood",
    "value": 370.92,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-26",
    "description": "Boleto LF Neto",
    "value": 382.62,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-03",
    "description": "Ifood",
    "value": 2935.56,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 454,
    "description": "CNH Daniel Emprestimo (4/4)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 365,
    "description": "Emp. Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-16",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "date": "2025-08-27",
    "description": "Ifood",
    "value": 3692,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 165.43,
    "description": "Boleto Nestlé",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-02",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (17/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-05-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (6/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "type": "Despesa",
    "value": 129.9,
    "description": "Internet",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-09",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (1/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-03-05",
    "description": "Seguro Imóvel 1/3",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Fatura Detalhada",
    "bankId": "EmT3wtErD97yCUdJSI14",
    "items": [
      {
        "description": "Teste 3  (3/4)",
        "value": 10,
        "category": "Custos (CMV/CMV)"
      },
      {
        "description": "teste  (3/3)",
        "value": 50,
        "category": "Custos (CMV/CMV)"
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 10,
        "description": "Teste (3/3)"
      },
      {
        "description": "Teste (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 80
      },
      {
        "description": "Teste (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 70
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 10,
        "description": "teste 2  (3/3)"
      },
      {
        "description": "dfsfdf (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 20
      }
    ],
    "value": 380.3
  },
  {
    "date": "2025-11-05",
    "description": "Luz Corredor",
    "value": 40,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (51/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-23",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "description": "Boleto LF Neto",
    "value": 233.47,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "date": "2025-06-20",
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (7/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 112.84,
    "description": "Frete Café BH",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-10-10",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (6/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (28/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-15",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-05-12",
    "description": "Valorizzi Contabilidade Burguer",
    "value": 459.15,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (2/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-02-10"
  },
  {
    "date": "2025-04-05",
    "description": "Luz Corredor",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Teste 3  (4/4)",
        "category": "Custos (CMV/CMV)",
        "value": 10
      }
    ],
    "value": 50
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-09-19",
    "description": "INSS - Léo",
    "value": 248,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (13/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-01-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (2/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "date": "2025-03-05",
    "description": "Luz Corredor",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "bankId": "zAo5QdJBtjbvIQnzhPPc",
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "cgvfd (3/3)",
        "category": "Custos (CMV/CMV)",
        "value": 10
      }
    ],
    "value": 40
  },
  {
    "date": "2025-09-08",
    "description": "Anota ai Açaí",
    "value": 449.97,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-05-05"
  },
  {
    "date": "2025-05-21",
    "description": "Ifood",
    "value": 3610.5,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-04-05"
  },
  {
    "type": "Receita",
    "description": "Ifood (2/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-14",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 1262.4,
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-07-17",
    "description": "Sistema Bling Burguer do Zé",
    "value": 55,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Outros"
  },
  {
    "date": "2025-03-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (9/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "description": "Emprestimo Nubank Léo - 4/12",
    "value": 1112.35,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05",
    "category": "Emprestimo"
  },
  {
    "date": "2025-04-29",
    "description": "Emprestimo",
    "value": 6322.05,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-26",
    "description": "Firjan",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-12",
    "description": "Internet",
    "value": 99.9,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 147.29,
    "description": "Nubank Léo Prime  (3/3)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-09",
    "category": "Material de Escritório",
    "isPaid": false
  },
  {
    "date": "2025-02-12",
    "description": "Valorizzi",
    "value": 950,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços\r",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (19/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-07-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (8/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "date": "2025-08-13",
    "description": "Ifood",
    "value": 3077.27,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-15",
    "description": "Boleto LF Neto",
    "value": 293.1,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (11/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-11-20",
    "items": []
  },
  {
    "description": "INSS - Julio",
    "value": 166.98,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "description": "Pró Labore - Léo",
    "value": 1400,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-26"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (5/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-05-20",
    "items": []
  },
  {
    "date": "2025-10-08",
    "description": "Pago",
    "value": 4240.73,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Pró Labore - Léo",
    "value": 1665,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-29"
  },
  {
    "date": "2025-09-08",
    "description": "Empréstimo 99 Leo 1/3",
    "value": 857.95,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-07-09",
    "description": "Emp. Julio",
    "value": 2700,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-08-05",
    "description": "Diarias Isa Julho",
    "value": 347.98,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Pessoal e Salários"
  },
  {
    "date": "2025-08-10",
    "description": "Internet",
    "value": 100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-08-20",
    "description": "Ifood",
    "value": 2517.21,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (46/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (8/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-11-05"
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (4/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "date": "2025-04-05",
    "description": "Seguro Imóvel 2/3",
    "value": 130.3,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (1/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "date": "2026-01-10",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 29.99,
    "description": "cortina pia",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-17",
    "category": "Outros",
    "isPaid": true
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Léo Promos Bramil",
    "value": 158.41,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-28",
    "description": "Cartão Caixa Léo",
    "value": 167.57,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-08-10",
    "description": "Contador Burguer",
    "value": 450,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 490,
    "description": "Emp Vanuza 1/3",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-11-10",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "date": "2025-10-06",
    "description": "Emp. Café Montserrat",
    "value": 6000,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-17",
    "description": "Luz",
    "value": 469.36,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-04-08",
    "description": "Nubank Fatura PJ",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 3573.62
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (44/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "description": "Luz",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-16",
    "category": "Água, Luz e Internet",
    "isPaid": true,
    "items": [],
    "value": 561.39
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (2/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (8/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-20",
    "description": "Imposto Burguer",
    "value": 327.38,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (9/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-07"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (43/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-28",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-09-03",
    "description": "Anota ai Açaí",
    "value": 215.17,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (38/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-23",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-10-01",
    "description": "Pago",
    "value": 3042,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 500,
    "description": "Bônus Isabela (1/2)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-20",
    "category": "Pessoal e Salários",
    "items": [],
    "isPaid": true
  },
  {
    "date": "2025-04-16",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1335.1
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-04-16",
    "description": "Luz",
    "value": 241.23,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (45/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (6/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-06-20",
    "items": []
  },
  {
    "date": "2025-09-07",
    "description": "Empréstimo 99 Leo 3/3",
    "value": 535.47,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 337.62,
    "description": "Boleto Nestlé",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-11-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-03-17",
    "description": "Luz",
    "value": 174.69,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-07-29",
    "description": "Vendas Ton",
    "value": 406.28,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (25/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-24",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-02-20",
    "description": "Imposto",
    "value": 337.67,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (3/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-03-20",
    "items": []
  },
  {
    "date": "2025-11-20",
    "description": "Pic Pay Fatura",
    "value": 5713.17,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 98.63,
    "description": "Compra Rio Quality Stdr Léo (1/2)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-16",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Imposto - Açaí  (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-20",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "items": [],
    "value": 531
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (3/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "date": "2025-07-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (30/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-29",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-05",
    "description": "Ifood",
    "value": 1442.7,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-06-09",
    "description": "Emprestimo Denilson",
    "value": 7000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (6/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-09",
    "description": "Internet",
    "value": 100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-11-15",
    "description": "Neon Fatura",
    "value": 1055.38,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (42/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-21",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-14",
    "description": "Boleto Camilo dos Santos",
    "value": 193,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (13/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-01",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (13/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-01",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 786.33,
    "description": "Entregas Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-24",
    "category": "Prestação de Serviços",
    "items": [],
    "isPaid": true
  },
  {
    "date": "2025-07-09",
    "description": "Ifood",
    "value": 2838.7,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-08",
    "description": "Nubank Fatura PJ",
    "value": 2961.99,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (35/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-02",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": true,
    "date": "2025-12-10"
  },
  {
    "date": "2025-03-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-29",
    "description": "Emprestimo Daniel",
    "value": 900,
    "type": "Despesa",
    "category": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-29",
    "description": "Pró Labore - Léo",
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2000
  },
  {
    "date": "2025-07-09",
    "description": "Ifood",
    "value": 1869.44,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (7/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 428.17,
    "description": "Diarias Isa Julho",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "date": "2025-03-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-08-06",
    "description": "Empréstimo 99 Leo 4/6",
    "value": 1050.62,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 6000,
    "description": "Emprestimo 99 léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-06",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "date": "2025-08-26",
    "description": "Emprestimo",
    "value": 163,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (2/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-16",
    "category": "Emprestimo",
    "type": "Receita",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (2/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (18/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-06",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-01",
    "description": "Boleto M. Mix 1/3",
    "value": 2604.07,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "Inss Leo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-17",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-08-05"
  },
  {
    "date": "2025-04-28",
    "description": "Boleto Nestlé",
    "value": 145.44,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-05",
    "description": "Ifood",
    "value": 2454.13,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (41/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-14",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "description": "Ifood (3/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-21",
    "category": "Venda de Mercadorias",
    "isPaid": false,
    "items": [],
    "value": 1497
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (47/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-05-20",
    "description": "Pic Pay Fatura",
    "value": 3636.65,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 65,
    "description": "Fatura Santander - Verificar se é a ult. mesmo.",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-20",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (8/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "date": "2025-08-12",
    "description": "Anota ai",
    "value": 151.03,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-11-14",
    "description": "Detetização",
    "value": 400,
    "type": "Despesa",
    "category": "Manutenção e Reparos",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-04",
    "description": "Mister Mix:",
    "value": 2011.83,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-20",
    "description": "Pic Pay Fatura",
    "value": 4406,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-04-07",
    "description": "Emprestimo Nubank Léo - 2/12",
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1112.35
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (21/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-27",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2010,
    "description": "Entregas Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-10",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "date": "2025-06-25",
    "description": "Ifood",
    "value": 3130.92,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-21",
    "description": "Boleto LF Neto",
    "value": 301.89,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (3/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 549.53,
    "description": "Licença",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-12",
    "category": "Impostos e Taxas",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-07-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (5/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-09-24",
    "description": "Ifood",
    "value": 1518.18,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-05",
    "description": "Físico",
    "value": 33,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (45/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (20/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-20",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "description": "Ifood",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-24",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 3942.96,
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-03-20",
    "description": "Pic Pay",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2950.94,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-15",
    "description": "Andim Kraft",
    "value": 124.45,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-20",
    "description": "Adesivo Print Lab Xpress",
    "value": 15,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "description": "Contador Burguer",
    "value": 459.15,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "date": "2025-06-14"
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (4/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-08-20",
    "description": "Santader Conta",
    "value": 150,
    "type": "Despesa",
    "category": "Despesas Financeiras",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (7/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (5/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-10-13",
    "description": "ALF Neto",
    "value": 284.58,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-10",
    "description": "Compra Rio Quality Stdr Léo 3/6",
    "value": 98.63,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (14/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-08",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-05-14",
    "description": "Emprestimo Daniel",
    "value": 150,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-03-05"
  },
  {
    "date": "2025-08-02",
    "description": "Taxa Vigilancia 2/4",
    "value": 108,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-12",
    "description": "Ifood",
    "value": 3082.83,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (50/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-16",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (5/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-13",
    "description": "Sthek Limpeza da Caixa D'água",
    "value": 240,
    "type": "Despesa",
    "category": "Manutenção e Reparos",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "date": "2026-01-05",
    "isPaid": true
  },
  {
    "date": "2025-07-05",
    "description": "Luz Corredor",
    "value": 40,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (38/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-23",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 525.64,
    "description": "neon fatura adiantamento",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-10",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 117.91,
    "description": "Taxa Alvara de Funcionamento",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Impostos e Taxas",
    "isPaid": true,
    "date": "2025-12-05"
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-11-24",
    "description": "Emprestimo",
    "value": 368,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-10",
    "description": "Pago",
    "value": 10000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (9/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-07",
    "description": "Boletos Nestlé",
    "value": 648.69,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 274,
    "description": "Embalagens Café",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-08",
    "category": "Investimentos",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 128.55,
    "description": "Atacadão",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-01-12",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-03-11",
    "description": "Aluguel Sala Antiga",
    "value": 560,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "INSS - Léo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "date": "2025-01-22",
    "description": "Ifood",
    "value": 1300.93,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (13/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-04-16",
    "description": "Boleto Nestlé",
    "value": 64.8,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-29",
    "description": "Ifood",
    "value": 1003.12,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-08-06",
    "description": "Ifood",
    "value": 2597.28,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-06-18",
    "description": "Ifood",
    "value": 2371.54,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (49/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-09",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-02-20",
    "description": "Fatura Santander",
    "value": 504.83,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-01-15",
    "description": "Mister Mix:",
    "value": 1191.36,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-08",
    "description": "Boleto M.Mix 2/2",
    "value": 3901.68,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (8/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-08-27",
    "description": "Pró Labore - Léo",
    "value": 1200,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-20",
    "description": "Imposto",
    "value": 816.01,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-14",
    "description": "Ifood",
    "value": 2633.78,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (43/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-28",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-10-15",
    "description": "Luz",
    "value": 400,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-03-20",
    "description": "Arrecadação Leo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (5/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-07-10",
    "description": "Boleto LF Neto",
    "value": 473.87,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (17/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-29",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-01-14",
    "description": "Organisys Sistema:",
    "value": 160,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-05",
    "description": "Emprestimo Nubank Léo 1/12",
    "value": 1109.05,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-14",
    "description": "Ifood",
    "value": 248.09,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 335.2,
    "description": "Iphone Daniel",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "date": "2025-08-20",
    "description": "Imposto Açaí",
    "value": 512.61,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-10",
    "description": "Pix 6 Corridas Jonas",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 444.11,
    "description": "Nubank Léo R. Quality Açaís (6/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (16/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-22",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (3/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-08-29",
    "description": "Emprestimo Isa",
    "value": 170,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços",
    "items": []
  },
  {
    "date": "2025-08-08",
    "description": "Nubank Léo Prime 3/10",
    "value": 147.29,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 70,
    "description": "Limpeza Escada",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 3067.24,
    "description": "Fatura Nubank",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-01-08",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-10-08",
    "description": "Nubank Fatura PJ",
    "value": 4952.77,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-08-20",
    "description": "Pic Pay Fatura",
    "value": 3100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-29",
    "description": "Vendas Pix",
    "value": 482.61,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-08-13",
    "description": "Boleto Nestlé",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Custos (CMV/CMV)",
    "isPaid": true,
    "value": 356.52
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (3/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (11/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-07-05"
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 80,
    "description": "banana ",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-26",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200.93,
    "description": "Caixa Léo Fatura",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-28",
    "category": "Fatura Detalhada",
    "isPaid": false,
    "items": [
      {
        "description": "Americanas",
        "category": "Custos (CMV/CMV)",
        "value": 70.93
      },
      {
        "description": "Atacadão",
        "category": "Custos (CMV/CMV)",
        "value": 130
      }
    ]
  },
  {
    "date": "2025-03-10",
    "description": "Organisys Sistema:",
    "value": 160,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-23",
    "description": "Ifood",
    "value": 2770,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (12/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Ton:",
    "value": 6224,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-16",
    "description": "Ifood",
    "value": 1816.69,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-05-21",
    "description": "Ifood",
    "value": 722.16,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-05-28",
    "description": "Ifood",
    "value": 513.56,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (12/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (5/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-05-10"
  },
  {
    "date": "2025-07-07",
    "description": "Empréstimo 99 Leo 3/6",
    "value": 1050.62,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-08",
    "description": "Boleto M. Mix 2/3",
    "value": 2605.58,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-12",
    "description": "Ifood",
    "value": 1095.15,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 454,
    "description": "CNH Daniel Emprestimo (1/4)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "date": "2025-05-07",
    "description": "Empréstimo 99 Daniel 2/9",
    "value": 1197.36,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-10",
    "description": "Internet",
    "value": 100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-01-13",
    "description": "Internet",
    "value": 110,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "description": "Nubank Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-08",
    "category": "Fatura Detalhada",
    "items": [
      {
        "category": "Custos (CMV/CMV)",
        "description": "Rio Quality 1/6",
        "value": 444.11
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 165,
        "description": "Atacadão"
      },
      {
        "description": "Prime 8/10",
        "category": "Custos (CMV/CMV)",
        "value": 147.3
      },
      {
        "category": "Custos (CMV/CMV)",
        "description": "Nova Mix",
        "value": 66
      },
      {
        "description": "Novamix",
        "category": "Custos (CMV/CMV)",
        "value": 106.64
      },
      {
        "description": "Açougue Maravilha",
        "category": "Custos (CMV/CMV)",
        "value": 174
      },
      {
        "description": "Lojas Americanas",
        "category": "Custos (CMV/CMV)",
        "value": 73.95
      },
      {
        "description": "Horti Fruti",
        "category": "Custos (CMV/CMV)",
        "value": 35.94
      },
      {
        "description": "Horti Frut",
        "category": "Custos (CMV/CMV)",
        "value": 71.88
      }
    ],
    "value": 1284.82,
    "isPaid": true
  },
  {
    "date": "2025-06-18",
    "description": "Ifood",
    "value": 1701.09,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (5/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "description": "Compra Rio Quality Stdr Léo 1/6",
    "value": 98.63,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-27",
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 695.29,
    "description": "Licença e Alavará 2024",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-12",
    "category": "Impostos e Taxas",
    "isPaid": true
  },
  {
    "date": "2025-10-04",
    "description": "Pix Andinho Kraft",
    "value": 66.5,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-04-20",
    "description": "INSS Leo",
    "value": 248.09,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (15/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-15",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-03",
    "isPaid": false,
    "description": "Emprestimo Nubank Giro (3/6)",
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Atacadão",
    "value": 76.21,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Rei do Descartável",
    "value": 32,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-09-03",
    "description": "Ifood",
    "value": 1181.39,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (10/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-03-28",
    "description": "Nestlé",
    "value": 354.1,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Daniel",
    "value": 570,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-01-15",
    "description": "Ifood",
    "value": 1914.56,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (1/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-03",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 184.76,
    "description": "Anota ai Burguer - 01/12 a 18/12 ",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-18",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Daniel",
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1690
  },
  {
    "date": "2025-05-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-10",
    "description": "Ifood",
    "value": 1608.11,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-10-28",
    "description": "Pago",
    "value": 1513.47,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (7/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-11-19",
    "description": "Ifood",
    "value": 4143.82,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1879.2,
    "description": "Plano de Saúde",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "date": "2025-01-12",
    "description": "Nestlé",
    "value": 50.13,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (39/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-30",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (7/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-07-20",
    "items": []
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "date": "2025-08-05",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (2/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 5.72,
    "description": "Guia do FGTS",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-18",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (20/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-20",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-04-16",
    "description": "Ifood",
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 3174.76
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (21/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-27",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (7/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "description": "Imposto - burguer  (1/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "items": [],
    "value": 262.28
  },
  {
    "date": "2025-05-07",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-15",
    "description": "Pedido M. Mix 2/3",
    "value": 2566.35,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (52/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-30",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-04-20",
    "description": "Santander",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1109
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 390.34,
    "description": "Vendas por fora",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-22",
    "category": "Fatura Detalhada",
    "isPaid": true,
    "items": [
      {
        "description": "Anota ai ",
        "category": "Venda de Mercadorias",
        "value": 33.61
      },
      {
        "description": "Anota ai ",
        "category": "Venda de Mercadorias",
        "value": 230.85
      },
      {
        "description": "Pedido Thalia",
        "category": "Venda de Mercadorias",
        "value": 47.56
      },
      {
        "description": "Pedido Thalia",
        "category": "Venda de Mercadorias",
        "value": 78.32
      }
    ]
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-09-28",
    "description": "Empréstimo Léo",
    "value": 260.6,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-01-16",
    "description": "Imposto",
    "value": 448.87,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (11/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-20",
    "description": "Anota ai",
    "value": 326.55,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (37/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-16",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-08-06",
    "description": "Empréstimo 99 Leo 2/3",
    "value": 530.31,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-09-05",
    "description": "Luz Corredor",
    "value": 50,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (46/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (10/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-03-19",
    "description": "Ifood",
    "value": 3216.32,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Emp. Dani",
    "value": 500,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-24",
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (52/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-30",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (3/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-11-17",
    "description": "Pago",
    "value": 271.33,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-08-11",
    "description": "Boleto LF Neto",
    "value": 279.2,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "description": "Contador Açaí (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-10",
    "category": "Contabilidade e outros serviços",
    "items": [],
    "value": 422,
    "isPaid": true
  },
  {
    "date": "2025-11-15",
    "description": "Boleto M. Mix 3/3",
    "value": 2605.58,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 6378.59,
    "description": "Ifood",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-10",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 753.66,
    "description": "Diárias Isabela Boleto Estácio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 394.59,
    "description": "Boleto Nestlé",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-26",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (3/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (11/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 120,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "description": "Imposto Açaí",
    "value": 457.99,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (9/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-09-17",
    "description": "Ifood",
    "value": 3999.09,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-15",
    "description": "Empréstimo Ton Leo Neon 2/3",
    "value": 604,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "description": "Empréstimo Leo",
    "value": 668,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-27",
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (25/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-24",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-09-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "date": "2025-01-01",
    "description": "Ifood",
    "value": 3392.94,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-20",
    "description": "Pró Labore - Léo",
    "value": 2248,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (48/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-02",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-15",
    "description": "Empréstimo Leo",
    "value": 450,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (36/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-09",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1108,
    "description": "Ifood",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-03",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "date": "2025-11-26",
    "description": "Ifood",
    "value": 5085.34,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (4/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-28",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 444.11,
    "description": "Nubank Léo R. Quality Açaís (4/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (7/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 156.2,
    "description": "Cartão Caixa Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-28",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-10-22",
    "description": "Imposto Açaí",
    "value": 631.35,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 5058.59,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-03",
    "category": "Venda de Mercadorias",
    "isPaid": true,
    "description": "Ifood ",
    "items": []
  },
  {
    "description": "Diarias Isa",
    "value": 800,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-02-27"
  },
  {
    "date": "2025-08-20",
    "description": "Emprestimo",
    "value": 294,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "date": "2025-12-20",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-09-08",
    "description": "Pagar 08/09",
    "value": 4000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-05",
    "description": "Ifood",
    "value": 4022.33,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (32/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-12",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-27",
    "description": "Ifood",
    "value": 1445,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (24/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-17",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 205.15,
    "description": "vigilância ",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-12",
    "category": "Impostos e Taxas",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (11/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-11-10"
  },
  {
    "date": "2025-09-08",
    "description": "Nubank Léo Prime 4/10",
    "value": 147.29,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-20",
    "description": "INSS - Léo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-20",
    "description": "Emp Daniel",
    "value": 94,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (40/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-07",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-03-20",
    "description": "Serviços da Conta",
    "value": 150,
    "type": "Despesa",
    "category": "Despesas Financeiras",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "description": "Ifood (1/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-01-07",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 645.38,
    "isPaid": true
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 1710,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-07",
    "description": "Ifood",
    "value": 2900.55,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (51/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-23",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-08",
    "description": "Nubank Fatura PJ",
    "value": 4657.82,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-04-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-16",
    "description": "Ifood",
    "value": 2537.09,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-16",
    "description": "Boleto Nestlé",
    "value": 375.88,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-23",
    "description": "Ifood",
    "value": 1465.27,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 6873.31,
    "description": "Ifood",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-30",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05"
  },
  {
    "date": "2025-08-20",
    "description": "INSS - Julio",
    "value": 167,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "description": "Luz",
    "value": 294.85,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-19",
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 255.4,
    "description": "Fatura Santander Atrasada",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-04",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "description": "Boleto Nestlé",
    "value": 276.72,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-16",
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 3660,
    "description": "Nubank Fatura PJ",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-09",
    "isPaid": true,
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Açougue",
        "category": "Custos (CMV/CMV)",
        "value": 86.83
      },
      {
        "description": "Novamix 1/3",
        "category": "Custos (CMV/CMV)",
        "value": 56
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 19.11
      },
      {
        "description": "Posto estrela",
        "category": "Combustível",
        "value": 29
      },
      {
        "description": "DC ",
        "category": "Custos (CMV/CMV)",
        "value": 37.99
      },
      {
        "description": "Super pao ",
        "category": "Custos (CMV/CMV)",
        "value": 4.49
      },
      {
        "description": "Super pao ",
        "category": "Custos (CMV/CMV)",
        "value": 22
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 17.04
      },
      {
        "description": "Comercial Friburguense",
        "category": "Manutenção e Reparos",
        "value": 90.57
      },
      {
        "description": "Ferragens Machado",
        "category": "Manutenção e Reparos",
        "value": 127
      },
      {
        "description": "HMMC materiais ",
        "category": "Manutenção e Reparos",
        "value": 47.5
      },
      {
        "description": "Facebook ",
        "category": "Marketing e Publicidade",
        "value": 99.97
      },
      {
        "description": "Canva ",
        "category": "Marketing e Publicidade",
        "value": 35
      },
      {
        "description": "JM comercio e industria  1/12",
        "category": "Ativo Imobilizado",
        "value": 99
      },
      {
        "description": "Nova Mix 1/3",
        "category": "Custos (CMV/CMV)",
        "value": 78.27
      },
      {
        "description": "Cereais Bramil 1/3",
        "category": "Custos (CMV/CMV)",
        "value": 49.3
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 23.96
      },
      {
        "description": "Jose Luix de carvalho - Mercado",
        "category": "Custos (CMV/CMV)",
        "value": 171.11
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 28.94
      },
      {
        "description": "Limpex",
        "category": "Uso e Consumo",
        "value": 26.96
      },
      {
        "description": "Superpao",
        "category": "Custos (CMV/CMV)",
        "value": 24.35
      },
      {
        "description": "Açougue",
        "category": "Custos (CMV/CMV)",
        "value": 83.69
      },
      {
        "description": "Superpao",
        "category": "Custos (CMV/CMV)",
        "value": 25.98
      },
      {
        "description": "NOVA mIX",
        "category": "Custos (CMV/CMV)",
        "value": 62.3
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 57.04
      },
      {
        "description": "Rio quality",
        "category": "Custos (CMV/CMV)",
        "value": 166.81
      },
      {
        "description": "Lojas americanas",
        "category": "Custos (CMV/CMV)",
        "value": 36.97
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 22.92
      },
      {
        "description": "Armazem canto leve",
        "category": "Custos (CMV/CMV)",
        "value": 95
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 9.99
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 48.08
      },
      {
        "description": "Açougue",
        "category": "Custos (CMV/CMV)",
        "value": 81.81
      },
      {
        "description": "Hortifruti",
        "category": "Custos (CMV/CMV)",
        "value": 5.98
      },
      {
        "description": "Rio quality 2/6",
        "category": "Custos (CMV/CMV)",
        "value": 153.59
      },
      {
        "description": "Rio quality 5/6",
        "category": "Custos (CMV/CMV)",
        "value": 142.59
      },
      {
        "description": "Mercado livre  10/10",
        "category": "Ativo Imobilizado",
        "value": 141.68
      },
      {
        "description": "Rio quality 3/6",
        "category": "Custos (CMV/CMV)",
        "value": 73.8
      },
      {
        "description": "Grafica 3/4",
        "category": "Custos (CMV/CMV)",
        "value": 60.49
      },
      {
        "description": "Mercado Livre",
        "category": "Ativo Imobilizado",
        "value": 78.62
      },
      {
        "description": "Atacadao 2/2",
        "category": "Custos (CMV/CMV)",
        "value": 117.39
      },
      {
        "description": "Mercado livre (copos)",
        "category": "Custos (CMV/CMV)",
        "value": 54.75
      },
      {
        "description": "Rio qualiti 4/6",
        "category": "Custos (CMV/CMV)",
        "value": 210.32
      },
      {
        "description": "Chilli Beans",
        "category": "Pró-Labore (Sócios)",
        "value": 241.16
      },
      {
        "description": "Mercado Livre 10/10",
        "category": "Ativo Imobilizado",
        "value": 90.35
      },
      {
        "description": "Rio quality 3/6",
        "category": "Custos (CMV/CMV)",
        "value": 171.15
      },
      {
        "description": "Rio quality 6/6",
        "category": "Custos (CMV/CMV)",
        "value": 49.7
      },
      {
        "description": "Shopee 2/10",
        "category": "Ativo Imobilizado",
        "value": 69.7
      },
      {
        "description": "Consumer",
        "category": "Outros",
        "value": 52.39
      },
      {
        "description": "99",
        "category": "Combustível",
        "value": 7.22
      },
      {
        "description": "Cereais Bramil",
        "category": "Custos (CMV/CMV)",
        "value": 74.14
      }
    ]
  },
  {
    "description": "Firjan",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-21"
  },
  {
    "date": "2025-09-10",
    "description": "Ifood",
    "value": 2622.95,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-02",
    "description": "Boleto M.Mix 1/2",
    "value": 3900.18,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-05",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Léo",
    "value": 769,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-20",
    "description": "INSS - Julio",
    "value": 166.98,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-18",
    "description": "Pedido FrigoCenter",
    "value": 365.19,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (4/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-11-09",
    "description": "Internet",
    "value": 100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (35/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-02",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (7/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-09-08",
    "description": "Empréstimo Julio",
    "value": 4000,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-10-15",
    "description": "Empréstimo Ton Leo Neon 3/3",
    "value": 604,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (8/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Julio",
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2700
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (5/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (4/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-04-10"
  },
  {
    "type": "Despesa",
    "value": 2062.89,
    "description": "Fatura Pic Pay",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-01-08",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Banana",
    "value": 95,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (12/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Ifood",
    "value": 2492.06,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-07",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (33/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-19",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-01-11",
    "description": "Taxas",
    "value": 280,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (6/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 444.11,
    "description": "Nubank Léo R. Quality Açaís (2/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 585,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-05",
    "description": "Seguro Imóvel 3/3",
    "value": 130.3,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-08",
    "description": "Pedido M. Mix 1/3",
    "value": 2425.95,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (10/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-10-20",
    "items": []
  },
  {
    "description": "P. Lábore Léo",
    "value": 800,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-29"
  },
  {
    "type": "Receita",
    "description": "Ifood",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-24",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 1130.16,
    "isPaid": true
  },
  {
    "date": "2025-04-05",
    "description": "Aluguel",
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2700
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-06-11",
    "description": "Ifood",
    "value": 1676.74,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-07-20",
    "description": "Imposto Açaí",
    "value": 754.05,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-06-04",
    "description": "Ifood",
    "value": 2123.94,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (10/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (6/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-02-08",
    "description": "Nubank",
    "value": 4290.39,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-24",
    "description": "Pró Labore - Léo",
    "value": 986,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "date": "2025-03-05",
    "description": "Ifood",
    "value": 4192.77,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-10",
    "description": "Taxas",
    "value": 270,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-20",
    "description": "Pic Pay Fatura",
    "value": 4427,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-03",
    "isPaid": false,
    "description": "Emprestimo Nubank Giro (4/6)",
    "category": "Emprestimo"
  },
  {
    "description": "Serviço Caio",
    "value": 500,
    "type": "Despesa",
    "category": "Manutenção e Reparos",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-02-27"
  },
  {
    "date": "2025-11-13",
    "description": "Embalagens Café 1/2",
    "value": 273.99,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-07",
    "description": "Emprestimo Nubank Léo - 5/12",
    "value": 1112.35,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-23",
    "description": "Ifood",
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 3466.69
  },
  {
    "date": "2025-09-08",
    "description": "Nubank Fatura PJ",
    "value": 4285,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-04",
    "description": "Anota ai Açaí",
    "value": 125,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Freezer + Frete",
    "value": 2000,
    "type": "Despesa",
    "category": "Ativo Imobilizado",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-21"
  },
  {
    "date": "2025-05-20",
    "description": "INSS - Leo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "date": "2025-11-17",
    "description": "Pago",
    "value": 758.66,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-30",
    "description": "Pró Labore - Léo",
    "value": 2000,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-10",
    "description": "Compra Rio Quality Stdr Léo 4/6",
    "value": 98.63,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-26",
    "description": "Ifood",
    "value": 995.5,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-03-03",
    "description": "Emprestimo",
    "value": 8000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-05",
    "description": "Luz Corredor",
    "value": 40,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 1133.32,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-06",
    "description": "Ifood",
    "value": 1245.21,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-02-26",
    "description": "Firjan",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (31/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-05",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-03-05",
    "description": "Bombeiro",
    "value": 330,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-03-26",
    "description": "Firjan",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-20",
    "description": "Santander",
    "value": 265,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-05-19",
    "description": "Boleto Nestlé",
    "value": 115.19,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-05",
    "description": "Nubank Léo Prime 5/10",
    "value": 147.29,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-20",
    "description": "Empréstimo Ton Pic Pay 2/6",
    "value": 836.83,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-03-05",
    "description": "Água",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (44/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "date": "2025-10-05",
    "description": "CNH Daniel",
    "value": 454,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Tainá",
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1200
  },
  {
    "type": "Despesa",
    "value": 193.86,
    "description": "Certificado Digital",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-24",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "date": "2025-07-20",
    "description": "Pic Pay Fatura",
    "value": 4708.39,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Léo",
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1076
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-11-01",
    "description": "Emp Daniel",
    "value": 1568.73,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (36/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-09",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-02-05"
  },
  {
    "date": "2025-03-20",
    "description": "Santander",
    "value": 975.75,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "description": "Fatura Neon",
    "date": "2026-01-15",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "items": [],
    "value": 1142,
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 975.76,
    "description": "Fatura Neon",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-15",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "date": "2025-03-10",
    "description": "Taxas Sala Antiga",
    "value": 326.07,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-02-21",
    "description": "Instalação Eletrica + Coifa",
    "value": 1070,
    "type": "Despesa",
    "category": "Manutenção e Reparos",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (9/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-04",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (33/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-19",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-07-10",
    "description": "Contabilidade Burguer",
    "value": 450,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (10/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-10-10"
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-10-28",
    "description": "Pago",
    "value": 4109.38,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-02",
    "description": "Taxa Alvara",
    "value": 242.29,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (26/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-01",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-03-25",
    "description": "Certificado Digital",
    "value": 180,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-05",
    "description": "Limpeza Caixa Dágua",
    "value": 120,
    "type": "Despesa",
    "category": "Manutenção e Reparos",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-19",
    "description": "Ifood",
    "value": 1437.8,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-17",
    "description": "Ifood",
    "value": 1242.59,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-11-29",
    "description": "Pró Labore - Léo Outubro",
    "value": 586,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-10",
    "description": "Emprestimo",
    "value": 94,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-20",
    "description": "Imposto Burguer",
    "value": 415.49,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-22",
    "description": "Imposto Burguer",
    "value": 302.57,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-05",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-11-05",
    "description": "Empréstimo 99 Leo 3/3",
    "value": 877.95,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Léo Colher M.L",
    "value": 138,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (28/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-15",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-05-20",
    "description": "Santander",
    "value": 861.36,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 290.5,
    "description": "Boleto LF Neto",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-01",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-11-03",
    "description": "Emprestimo Nubank Giro",
    "value": 2760,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-20",
    "description": "Imposto Burguer",
    "value": 142.08,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-06-25",
    "description": "Ifood",
    "value": 1544.26,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (19/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-13",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Imposto  Burguer",
    "value": 158.19,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-12-05"
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (6/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (16/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-04-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (5/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "date": "2025-10-22",
    "description": "Pago",
    "value": 1495.4,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-08-08",
    "description": "Nubank Fatura PJ",
    "value": 4170,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-03-05",
    "description": "Foro",
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 205
  },
  {
    "date": "2025-05-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-05",
    "description": "Emprestimo Léo | Mister Mix 1ª",
    "value": 2000,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-10",
    "description": "Aluguel",
    "value": 560,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-07",
    "description": "Valorizzi",
    "value": 950,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços\r",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-08",
    "description": "Emp.  Léo",
    "value": 2000,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Imposto Açaí",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-20",
    "category": "Impostos e Taxas",
    "items": [],
    "value": 609.81,
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-06-05",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-03-07",
    "description": "Taxa Bombeiros",
    "value": 210.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-22",
    "description": "Imposto Açaí",
    "value": 620.59,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-10-08",
    "description": "Pago",
    "value": 1018.76,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 147.29,
    "description": "Nubank Léo Prime  (1/3)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-09",
    "isPaid": true,
    "category": "Ativo Imobilizado",
    "items": []
  },
  {
    "date": "2025-03-26",
    "description": "Ifood",
    "value": 3093.85,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-14",
    "description": "Boleto Nestlé",
    "value": 151.45,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (19/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-13",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-02-05",
    "description": "Frigodario (Mc Cain)",
    "value": 254.25,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-05",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-05-15",
    "description": "Neon Léo",
    "value": 326.23,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-19",
    "description": "Will Daniel (Contador + Geladeira + Copos)",
    "value": 627,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (7/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "date": "2025-07-21",
    "description": "Imposto Burguer",
    "value": 264.67,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-04-09",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1171.69
  },
  {
    "date": "2025-09-03",
    "description": "Anota ai Burguer",
    "value": 35.92,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-12",
    "description": "Anota ai Burguer",
    "value": 22.86,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-05",
    "description": "Diarias Isa Julho",
    "value": 428.17,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-02",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1336.6
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 347.98,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05"
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (1/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-16",
    "isPaid": true,
    "category": "Emprestimo",
    "items": []
  },
  {
    "date": "2025-10-10",
    "description": "Bling",
    "value": 55,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-03-12",
    "description": "Atacadão",
    "value": 218.15,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-10-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "type": "Despesa",
    "value": 487.41,
    "description": "Boleto LF Neto",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-29",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-08-06",
    "description": "Empréstimo 99 Leo 1/3",
    "value": 442.35,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-08",
    "description": "Emp. Julio",
    "value": 1200,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-07-05",
    "description": "Diarias Isa",
    "value": 350,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Pessoal e Salários"
  },
  {
    "date": "2025-11-28",
    "description": "Kraft Andim",
    "value": 91,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-03-17",
    "description": "Nestle",
    "value": 175.15,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (4/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-28",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-07-08",
    "description": "Nubank Léo Prime 2/10",
    "value": 147.29,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-09",
    "description": "Emp. Daniel",
    "value": 341,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (18/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-06-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (7/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "type": "Despesa",
    "description": "Imposto Burguer",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-20",
    "category": "Impostos e Taxas",
    "items": [],
    "value": 114.43,
    "isPaid": true
  },
  {
    "date": "2025-09-10",
    "description": "Boleto Nestlé",
    "value": 354.56,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-04-10",
    "description": "Organisys Sistema:",
    "value": 185,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-25",
    "description": "Mister Mix",
    "value": 6099,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-08-20",
    "description": "Santander",
    "value": 2063.1,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-09",
    "description": "Anota ai Burguer",
    "value": 52.86,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-05",
    "category": "Aluguel e Condomínio",
    "isPaid": true
  },
  {
    "date": "2025-05-16",
    "description": "Luz",
    "value": 239.78,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (4/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-04-09",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1173.18
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (13/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-08-13",
    "description": "Ifood",
    "value": 1069.5,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (12/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (24/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-17",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-10-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "date": "2025-03-24",
    "description": "Internet",
    "value": 100,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (20/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-08-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (9/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (9/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "date": "2025-02-12",
    "description": "Atacadão",
    "value": 287.83,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-02",
    "description": "Ifood",
    "value": 1017.55,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-05-05",
    "description": "Luz Corredor",
    "value": 40,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (9/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-09-10"
  },
  {
    "description": "Empréstimo Julio 1/1",
    "value": 2000,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-14",
    "category": "Emprestimo"
  },
  {
    "date": "2025-04-29",
    "description": "Diarias Isa",
    "value": 300,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-04-05",
    "description": "Condominio",
    "value": 70,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (12/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (18/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-06",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-04-02",
    "description": "Ifood",
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 4442.18
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (16/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-22",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-10-08",
    "description": "Sábado Nu Léo -",
    "value": 174.86,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-06-04",
    "description": "Ifood",
    "value": 2446.35,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 605.18,
    "description": "Pagamento Ifood",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-30",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (6/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-02-20",
    "description": "Pic Pay",
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1131.14,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-09-20",
    "description": "Santander",
    "value": 265.9,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (3/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-03-10"
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1621.63,
    "description": "Ifood",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-10",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "date": "2025-07-07",
    "description": "Empréstimo 99 Leo 1/3",
    "value": 440.63,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-18",
    "description": "INSS - Léo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-02-07",
    "description": "Nestlé:",
    "value": 622.74,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 833.71,
    "description": "Entregas - Léo ",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-02",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "date": "2025-10-06",
    "description": "Empréstimo 99 Leo",
    "value": 2385,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "Pró Labore - Léo",
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2000,
    "date": "2025-03-30"
  },
  {
    "date": "2025-10-22",
    "description": "Pago",
    "value": 4278.04,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 89,
    "description": "Sacos Kraft Andim",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-07",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-02-19",
    "description": "Ifood",
    "value": 3870.9,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "date": "2025-01-10",
    "description": "Aluguel",
    "value": 560,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-10-20",
    "description": "Contador Burguer",
    "value": 450,
    "type": "Despesa",
    "category": "contabilidade e outros serviços",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (6/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-04-29",
    "description": "Ifood",
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2913.38
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (7/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 5841.69,
    "description": "Ifood",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-17",
    "category": "Venda de Mercadorias",
    "isPaid": true
  },
  {
    "date": "2025-11-05",
    "description": "Diarias Isa Julho",
    "value": 428.17,
    "type": "Despesa",
    "category": "Pessoal e Salários",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 200,
    "description": "Emprestimo Isabela",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-24",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 144,
    "description": "Morango",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Custos (CMV/CMV)",
    "date": "2025-12-24",
    "isPaid": true,
    "items": []
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-04-09",
    "description": "Pix Andrey Maia",
    "value": 240,
    "type": "Despesa",
    "category": "Marketing e Publicidade",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-03",
    "isPaid": false,
    "description": "Emprestimo Nubank Giro (5/6)",
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 71.54,
    "description": "Pagamento 13° Isabela",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-18",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (26/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-01",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-10-28",
    "description": "Cartão Caixa Léo Promos Bramil",
    "value": 214.7,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (23/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-10",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-08-08",
    "description": "Empréstimo Leo",
    "value": 3152.95,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (15/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-15",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-04-02",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1173.18
  },
  {
    "type": "Despesa",
    "value": 92.16,
    "description": "Fatura Santander",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-20",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-09-13",
    "description": "Andinho Saco Kraft",
    "value": 45,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-29",
    "description": "Pró Labore - Léo Novembro",
    "value": 2000,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 800,
    "description": "Diarias Isa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-03-29",
    "category": "Pessoal e Salários",
    "isPaid": true
  },
  {
    "date": "2025-08-15",
    "description": "Empréstimo Leo",
    "value": 352,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 99.9,
    "description": "Internet",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-06-10",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "date": "2025-09-16",
    "description": "Luz",
    "value": 672.81,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-05-28",
    "description": "Ifood",
    "value": 3123,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-10-20",
    "description": "Empréstimo Ton Pic Pay 3/6",
    "value": 836.83,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-24",
    "description": "Ifood",
    "value": 3712.71,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-27",
    "description": "Empréstimo Tainá 1/1",
    "value": 250,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-05-20",
    "description": "Imposto",
    "value": 414.61,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (10/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-03-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-04-07",
    "description": "Empréstimo 99 Daniel 1/9",
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1197.36
  },
  {
    "date": "2025-11-17",
    "description": "INSS - Léo",
    "value": 247.28,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-03-12",
    "description": "Ifood",
    "value": 3693.49,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-27",
    "description": "Exame Isabela",
    "value": 50,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Pessoal e Salários"
  },
  {
    "date": "2025-10-01",
    "description": "Pago",
    "value": 1183,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-03",
    "description": "Emprestimo Nubank Giro (2/6)",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "description": "Emprestimo Nubank Giro 1/6 (1/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-03",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo Nubank Léo - 6/12",
    "value": 1084.33,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-04-20",
    "description": "Pic Pay Fatura",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 2791.64
  },
  {
    "date": "2025-08-15",
    "description": "Empréstimo Ton Leo Neon 1/3",
    "value": 604,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-04-24",
    "description": "Internet",
    "value": 102.31,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-09-22",
    "description": "Pedido M. Mix 3/3",
    "value": 2566.35,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-04-22",
    "description": "Imposto",
    "value": 798.21,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-05-05",
    "description": "Emprestimo Nubank Léo - 3/12",
    "value": 1107.73,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (15/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-03-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (4/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "date": "2025-10-15",
    "description": "Pago",
    "value": 1364.79,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-09-05",
    "description": "Provisionamento",
    "value": 120,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-06-06",
    "description": "Emprestimo 99",
    "value": 1400,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1026,
    "description": "neon fatura",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-11",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "description": "Boleto M. Mix",
    "value": 2725,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05",
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 6303.03,
    "description": "Fatura Pic Pay",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-20",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "date": "2025-03-12",
    "description": "Pix Emprestado Santander",
    "value": 1517.62,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 531.62,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Venda de Mercadorias",
    "isPaid": true,
    "description": "Anota ai - Açaí 01/12 a 18/12",
    "items": [],
    "date": "2025-12-18"
  },
  {
    "date": "2025-10-20",
    "description": "INSS - Julio",
    "value": 166.98,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (8/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-08-10"
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (12/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-10-27",
    "description": "Pró Labore - Léo",
    "value": 350,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-10",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (11/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-10-05",
    "description": "Agua",
    "value": 340,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "date": "2025-02-10",
    "description": "Organisys Sistema:",
    "value": 160,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (6/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-06-10"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (8/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (37/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-16",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (8/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-08-20",
    "items": []
  },
  {
    "date": "2025-05-20",
    "description": "Boleto LF Neto",
    "value": 424.61,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-10",
    "description": "Contador Burguer",
    "value": 450,
    "type": "Despesa",
    "category": "Contabilidade e outros serviços",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-08-17",
    "description": "Bling",
    "value": 55,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Outros"
  },
  {
    "description": "Empréstimo 99 Leo 2/6",
    "value": 1050.62,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05"
  },
  {
    "date": "2025-04-09",
    "description": "Ifood",
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 3015.92
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (8/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-09-05",
    "description": "Importado via Planilha",
    "value": 40000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-04-12",
    "description": "Atacadão Cartão Fatura",
    "value": 198.05,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 78.85,
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2025-12-13",
    "category": "Custos (CMV/CMV)",
    "isPaid": true,
    "description": "Sacos Kraft Andim",
    "items": []
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (22/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-03",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "description": "Ifood (3/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-21",
    "category": "Venda de Mercadorias",
    "isPaid": false,
    "items": [],
    "value": 6181
  },
  {
    "type": "Despesa",
    "value": 1812.66,
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-03",
    "isPaid": false,
    "description": "Emprestimo Nubank Giro (6/6)",
    "category": "Emprestimo"
  },
  {
    "date": "2025-09-10",
    "description": "Compra Rio Quality Stdr Léo 2/6",
    "value": 98.63,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 500,
    "description": "Bônus Isabela (2/2)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (8/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Saldo Junho",
    "value": 3591,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "description": "Ifood (1/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-07",
    "category": "Venda de Mercadorias",
    "items": [],
    "value": 2353.27,
    "isPaid": true
  },
  {
    "date": "2025-09-07",
    "description": "Anota ai Burguer",
    "value": 77.01,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-09-07",
    "description": "Anota ai Açaí",
    "value": 65.27,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (9/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-11-03",
    "description": "Boleto LF Neto",
    "value": 339.68,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (8/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (10/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-10-05"
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Pró Labore - Léo",
    "value": 2000,
    "type": "Despesa",
    "category": "Pró-Labore (Sócios)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (4/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-04-20",
    "items": []
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-01-08",
    "description": "Ifood",
    "value": 1542.23,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "description": "2/6 CNH Daniel Empréstimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-11-10",
    "category": "Emprestimo",
    "isPaid": true,
    "type": "Receita",
    "value": 454
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - Açaí  (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "date": "2025-04-29",
    "description": "Pix Galera",
    "value": 109.27,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (3/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (50/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-16",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (27/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-08",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-11-05",
    "description": "Aluguel",
    "value": 2700,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Aluguel e Condomínio"
  },
  {
    "date": "2025-07-10",
    "description": "Internet",
    "value": 99.9,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Água, Luz e Internet",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS - Julio (2/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Impostos e Taxas",
    "isPaid": false,
    "date": "2026-02-20",
    "items": []
  },
  {
    "date": "2025-05-20",
    "description": "Imposto burguer",
    "value": 103.74,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (11/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-11-05",
    "description": "Emprestimo Nubank Garantia 1",
    "type": "Despesa",
    "category": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 608
  },
  {
    "date": "2025-07-18",
    "description": "INSS - Julio",
    "value": 167,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-04-16",
    "description": "Boleto LF Neto",
    "value": 246.56,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-07-23",
    "description": "Empréstimo Daniel",
    "value": 1690,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (41/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-10-14",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 248,
    "description": "INSS - Léo (1/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1210.86,
    "description": "Plano de Saúde Amil (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Outros",
    "isPaid": false
  },
  {
    "date": "2025-04-16",
    "description": "Boleto M. Mix",
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1336.6
  },
  {
    "type": "Despesa",
    "value": 200,
    "description": "Água (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-03-05",
    "description": "IPTU",
    "value": 1130,
    "type": "Despesa",
    "category": "Aluguel e Condomínio",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-08",
    "description": "Nubank Léo Prime 6/10",
    "value": 147.29,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 167,
    "description": "INSS Julio (5/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-05-20",
    "category": "Impostos e Taxas",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 1331.66,
    "description": "Pró Labore - Léo ",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-02",
    "isPaid": true,
    "category": "Pró-Labore (Sócios)"
  },
  {
    "type": "Despesa",
    "value": 2700,
    "description": "Aluguel (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-05",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "date": "2025-09-08",
    "description": "Empréstimo 99 Leo 5/6",
    "value": 1050.62,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-03-08",
    "description": "Nubank",
    "value": 3974.48,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (6/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-09-11",
    "description": "CNH Daniel Empréstimo",
    "value": 2720,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-07-02",
    "description": "Taxa Vigilancia 1/4",
    "value": 108.17,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-09-17",
    "description": "Empréstimo Daniel",
    "value": 800,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-15",
    "description": "Pago",
    "value": 4211.62,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-15",
    "description": "Luz",
    "value": 171.93,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-11-12",
    "description": "Ifood",
    "value": 4030.19,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 444.11,
    "description": "Nubank Léo R. Quality Açaís (3/6)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-05",
    "category": "Custos (CMV/CMV)",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (47/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-11-25",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-09-12",
    "description": "Recebidos Pix / Ton",
    "value": 345.61,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-06-09",
    "description": "Emprestimo Júlio",
    "value": 2000,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-08-05",
    "description": "Luz Corredor",
    "value": 59.3,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-03-06",
    "description": "Rozilma- Morango",
    "value": 125,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-08-20",
    "description": "INSS - Léo",
    "value": 248,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (2/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-16",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (40/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-10-07",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "description": "Nubank PJ",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-08",
    "isPaid": true,
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Hortifruti J J ",
        "category": "Custos (CMV/CMV)",
        "value": 8.99
      },
      {
        "description": "Atacadao 1/3",
        "category": "Custos (CMV/CMV)",
        "value": 130.22
      },
      {
        "description": "Atacadao 1/3",
        "category": "Custos (CMV/CMV)",
        "value": 150.38
      },
      {
        "description": "Hortifruti J J ",
        "category": "Custos (CMV/CMV)",
        "value": 62.96
      },
      {
        "description": "Canva ",
        "category": "Marketing e Publicidade",
        "value": 35
      },
      {
        "description": "Hortifruti J J ",
        "category": "Custos (CMV/CMV)",
        "value": 31.92
      },
      {
        "description": "Distribuidora de horti",
        "category": "Custos (CMV/CMV)",
        "value": 9.92
      },
      {
        "description": "Hortifruti J J ",
        "category": "Custos (CMV/CMV)",
        "value": 50.14
      },
      {
        "description": "DC",
        "category": "Custos (CMV/CMV)",
        "value": 92.97
      },
      {
        "description": "Dogaria H7 - leite em pó",
        "category": "Custos (CMV/CMV)",
        "value": 101.94
      },
      {
        "description": "Açougue Maravilha",
        "category": "Custos (CMV/CMV)",
        "value": 100
      },
      {
        "description": "jim.com ",
        "category": "Custos (CMV/CMV)",
        "value": 8
      },
      {
        "description": "Mv Plast",
        "category": "Custos (CMV/CMV)",
        "value": 57.78
      },
      {
        "description": "Novamix ",
        "category": "Custos (CMV/CMV)",
        "value": 26.99
      },
      {
        "description": "Casa do grao",
        "category": "Custos (CMV/CMV)",
        "value": 4.94
      },
      {
        "description": "Estação saúde",
        "category": "Custos (CMV/CMV)",
        "value": 95.94
      },
      {
        "description": "Atacada 1/2",
        "category": "Custos (CMV/CMV)",
        "value": 49.39
      },
      {
        "description": "Açougue Maravilha",
        "category": "Custos (CMV/CMV)",
        "value": 82.9
      },
      {
        "description": "Atacadao ",
        "category": "Custos (CMV/CMV)",
        "value": 186.66
      },
      {
        "description": "Horti fruti",
        "category": "Custos (CMV/CMV)",
        "value": 34.19
      },
      {
        "description": "DC",
        "category": "Custos (CMV/CMV)",
        "value": 50.98
      },
      {
        "description": "Mercado livre - Cremes",
        "category": "Custos (CMV/CMV)",
        "value": 464.98
      },
      {
        "description": "Rio quality 1/6",
        "category": "Custos (CMV/CMV)",
        "value": 49.44
      },
      {
        "description": "Açougue",
        "category": "Custos (CMV/CMV)",
        "value": 84.97
      },
      {
        "description": "Parada Pet",
        "category": "Custos (CMV/CMV)",
        "value": 36.8
      },
      {
        "description": "Açougue",
        "category": "Custos (CMV/CMV)",
        "value": 75
      },
      {
        "description": "Nova Mix",
        "category": "Custos (CMV/CMV)",
        "value": 26.99
      },
      {
        "description": "Pic Pay Julio",
        "category": "Emprestimo",
        "value": 418.21
      },
      {
        "description": "Rio quality 2/6",
        "category": "Custos (CMV/CMV)",
        "value": 166.81
      },
      {
        "description": "Rio quality 3/6",
        "category": "Custos (CMV/CMV)",
        "value": 153.59
      },
      {
        "description": "Nova mix 2/3",
        "category": "Custos (CMV/CMV)",
        "value": 78.26
      },
      {
        "description": "Rio quality 6/6",
        "category": "Custos (CMV/CMV)",
        "value": 142.59
      },
      {
        "description": "Rio quality 4/6",
        "category": "Custos (CMV/CMV)",
        "value": 73.8
      },
      {
        "description": "Novamix 2/3",
        "category": "Custos (CMV/CMV)",
        "value": 55.99
      },
      {
        "description": "Grafica  4/4",
        "category": "Marketing e Publicidade",
        "value": 60.49
      },
      {
        "description": "Mercado Livre 3/12",
        "category": "Ativo Imobilizado",
        "value": 78.62
      },
      {
        "description": "Super pao",
        "category": "Custos (CMV/CMV)",
        "value": 15.8
      },
      {
        "description": "Rio quality 4/6",
        "category": "Custos (CMV/CMV)",
        "value": 171.15
      },
      {
        "description": "Rio quality 5/6",
        "category": "Custos (CMV/CMV)",
        "value": 210.32
      },
      {
        "description": "Jm comercio e industria",
        "category": "Ativo Imobilizado",
        "value": 98.92
      },
      {
        "description": "Chilli beans",
        "category": "Emprestimo",
        "value": 241.16
      },
      {
        "description": "Shopee",
        "category": "Ativo Imobilizado",
        "value": 69.7
      },
      {
        "description": "Bramil 2/3",
        "category": "Custos (CMV/CMV)",
        "value": 49.3
      },
      {
        "description": "Consumer ",
        "category": "Outros",
        "value": 50
      },
      {
        "description": "Bramil 2/3",
        "category": "Custos (CMV/CMV)",
        "value": 74.14
      }
    ],
    "value": 4319.24
  },
  {
    "date": "2025-07-10",
    "description": "Boleto Bling - Burguer do zé",
    "value": 55,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Outros"
  },
  {
    "date": "2025-08-01",
    "description": "Empréstimo Tainá 1/1",
    "value": 1200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-10-08",
    "description": "Atacadão Nu Léo -",
    "value": 328,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (14/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-08",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-11-10",
    "description": "Contador Burguer",
    "value": 450,
    "type": "Despesa",
    "category": "contabilidade e outros serviços",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "description": "Emp. Léo",
    "value": 170,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-09-24",
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (49/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-12-09",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-09-10",
    "description": "Pagar 10/09 ( - Rocks)",
    "value": 560,
    "type": "Receita",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-01-29",
    "description": "Ifood",
    "value": 2840.52,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (34/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-08-26",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "description": "Nubank Fatura PJ",
    "value": 3588.39,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-08"
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (7/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-07-10"
  },
  {
    "date": "2025-09-08",
    "description": "Empréstimo 99 Leo 2/3",
    "value": 442.35,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (3/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 45,
    "description": "Luz Corredor",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-06",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "date": "2025-10-15",
    "description": "Boleto Frigodário",
    "value": 223.62,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-07-14",
    "description": "Boleto Nestlé",
    "value": 602.89,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-08-27",
    "description": "Emprestimo Daniel",
    "value": 800,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "date": "2025-06-11",
    "description": "Ifood",
    "value": 3797.21,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (8/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-07-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (12/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-11-16",
    "description": "Luz",
    "value": 462.44,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (10/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-11",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (23/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-06-10",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 454,
    "description": "CNH Daniel Emprestimo (3/4)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-02-26",
    "description": "Ifood",
    "value": 3324.73,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-10",
    "description": "Bling",
    "value": 55,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "date": "2025-11-19",
    "description": "INSS - Julio",
    "value": 167,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 223.3,
    "description": "Giz Móveis Daniel (4/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-03-16",
    "isPaid": false,
    "category": "Emprestimo"
  },
  {
    "date": "2025-09-05",
    "description": "Emprestimo Nubank Léo - 12/12",
    "value": 4910.79,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (30/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-07-29",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (5/13)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-10",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 465,
    "description": "Emp. Leo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-10",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 1000,
    "description": "Imposto - burguer  (4/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-04-20",
    "category": "Aluguel e Condomínio",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (4/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-11-05",
    "description": "Agua",
    "value": 200,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Água, Luz e Internet"
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (2/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-02-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (5/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-05-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 5038.57,
    "description": "Pic Pay Fatura",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-20",
    "category": "Custos (CMV/CMV)",
    "isPaid": true
  },
  {
    "date": "2025-07-20",
    "description": "Santander",
    "value": 1486,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "description": "Empréstimo 99 Daniel 3/9",
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-05",
    "value": 1186.13
  },
  {
    "type": "Receita",
    "value": 2500,
    "description": "Ifood (31/52)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-08-05",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "type": "Receita",
    "value": 1200,
    "description": "Ifood (7/52)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-02-18",
    "category": "Venda de Mercadorias",
    "isPaid": false
  },
  {
    "date": "2025-09-06",
    "description": "Andinho Saco Kraft",
    "value": 133,
    "type": "Despesa",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "type": "Despesa",
    "description": "Emprestimo Nubank Giro  (14/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2027-02-03",
    "isPaid": false,
    "category": "Fatura Detalhada",
    "value": 3191.84,
    "items": [
      {
        "description": "Açaí (3/9)",
        "category": "Custos (CMV/CMV)",
        "value": 500
      }
    ]
  },
  {
    "date": "2025-09-10",
    "description": "Empréstimo Tainá",
    "value": 600,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 370,
    "description": "Contador Açaí (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-06-10",
    "isPaid": false,
    "category": "Contabilidade e outros serviços"
  },
  {
    "value": 335.2,
    "description": "Iphone Daniel (5/10)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-16",
    "isPaid": false,
    "category": "Emprestimo",
    "type": "Receita"
  },
  {
    "date": "2025-08-05",
    "description": "Emprestimo",
    "value": 170,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (11/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "type": "Despesa",
    "value": 2000,
    "description": "Pró Labore Léo (4/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-04-26",
    "category": "Pró-Labore (Sócios)",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "99 Leo",
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "value": 1200
  },
  {
    "type": "Despesa",
    "value": 50,
    "description": "Luz Corredor (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-07-29",
    "description": "Emp. Léo",
    "value": 603,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Receita",
    "value": 454,
    "description": "CNH Daniel Emprestimo (2/4)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-05",
    "category": "Emprestimo",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 2691.84,
    "description": "Emprestimo Nubank Giro  (11/20)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-11-03",
    "category": "Emprestimo",
    "isPaid": false
  },
  {
    "date": "2025-10-02",
    "description": "Emprestimo Nubank Giro 1/24",
    "value": 2771.42,
    "type": "Despesa",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-11-10",
    "description": "Emprestimo",
    "value": 700,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-20",
    "description": "Cofrinho Pic Pay",
    "value": 298,
    "type": "Receita",
    "category": "Venda de Mercadorias",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "date": "2025-09-22",
    "description": "Emp. Dani",
    "value": 500,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 55,
    "description": "Bling (12/12)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "category": "Outros",
    "isPaid": false,
    "date": "2026-12-10"
  },
  {
    "type": "Despesa",
    "value": 40,
    "description": "Condominio (6/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "category": "Aluguel e Condomínio",
    "isPaid": false,
    "date": "2026-06-05"
  },
  {
    "date": "2025-09-02",
    "description": "Taxa Vigilancia 3/3",
    "value": 242.29,
    "type": "Despesa",
    "category": "Impostos e Taxas",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 450,
    "description": "Contador Burguer (10/13)",
    "storeId": "W8THHIbYwyJWfknkWtly",
    "date": "2026-09-16",
    "category": "Contabilidade e outros serviços",
    "isPaid": false
  },
  {
    "date": "2025-05-26",
    "description": "Firjan",
    "value": 50,
    "type": "Despesa",
    "category": "Outros",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "description": "Santander Léo - (Aberta Verificar)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-01-10",
    "category": "Fatura Detalhada",
    "items": [
      {
        "description": "Rio Quality 6/6",
        "category": "Custos (CMV/CMV)",
        "value": 98.63
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 61.52,
        "description": "Super Market 1/1"
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 46.99,
        "description": "Nova Mix"
      },
      {
        "description": "Nova Mix",
        "category": "Custos (CMV/CMV)",
        "value": 68.96
      },
      {
        "category": "Custos (CMV/CMV)",
        "value": 91.8,
        "description": "Açougue Maravilha"
      },
      {
        "description": "Teclado",
        "category": "Uso e Consumo",
        "value": 42
      }
    ],
    "value": 409.9,
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 120,
    "description": "Provisionamento (9/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-09-05",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-07-08",
    "description": "Nubank Fatura PJ",
    "value": 3511.15,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Custos (CMV/CMV)"
  },
  {
    "date": "2025-11-26",
    "description": "Emp Léo",
    "value": 710,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "type": "Despesa",
    "value": 129,
    "description": "Internet Loja Sumicity (12/12)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2026-12-10",
    "category": "Água, Luz e Internet",
    "isPaid": false
  },
  {
    "date": "2025-08-20",
    "description": "Empréstimo Ton Pic Pay 1/6",
    "value": 836.83,
    "type": "Despesa",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "category": "Emprestimo"
  },
  {
    "description": "Santander",
    "value": 1347.13,
    "type": "Despesa",
    "category": "Custos (CMV/CMV)",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true,
    "date": "2025-06-20"
  },
  {
    "date": "2025-09-16",
    "description": "Emp. Dani",
    "value": 800,
    "type": "Receita",
    "category": "Emprestimo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "isPaid": true
  },
  {
    "type": "Despesa",
    "value": 249.77,
    "description": "Entregas Léo",
    "storeId": "VhYM0uSasOXQneuURJS1",
    "date": "2025-12-09",
    "category": "Prestação de Serviços",
    "isPaid": true
  }
]::jsonb as data
),
profile_sel as (
  select id from public.profiles order by created_at limit 1
),
raw_tx as (
  select jsonb_array_elements(data) as tx
  from json_input
),
-- lojas: cria se nao existir pela storeId (external_id)
upsert_stores as (
  insert into public.stores (profile_id, name, external_id)
  select p.id,
         coalesce(tx->>'storeName', 'Loja ' || left(tx->>'storeId', 8)),
         tx->>'storeId'
  from raw_tx r
  cross join profile_sel p
  where (tx->>'storeId') is not null
    and not exists (select 1 from public.stores s where s.external_id = tx->>'storeId')
  returning id, external_id
),
all_stores as (
  select id, external_id from upsert_stores
  union all
  select id, external_id from public.stores
),
-- categorias: coleta tanto da categoria principal quanto das categorias dos itens
cats as (
  select distinct trim(both from tx->>'category') as cat
  from raw_tx
  where tx->>'category' is not null and tx->>'category' <> ''
  union
  select distinct trim(both from item->>'category') as cat
  from raw_tx r,
       lateral jsonb_array_elements(tx->'items') as item
  where item->>'category' is not null and item->>'category' <> ''
),
upsert_categories as (
  insert into public.finance_categories (profile_id, name, source)
  select p.id, cat, 'firebase'
  from cats, profile_sel p
  where cat is not null
    and not exists (
      select 1 from public.finance_categories fc
      where fc.profile_id = p.id and fc.name = cat
    )
  returning id, name
),
all_categories as (
  select id, name from upsert_categories
  union all
  select id, name from public.finance_categories
),
-- limpeza opcional de transacoes existentes
del as (
  delete from public.fin_transactions returning 1
)
insert into public.fin_transactions (
  profile_id,
  store_id,
  store_external_id,
  type,
  description,
  date,
  category,
  value,
  is_paid,
  bank_id,
  items
)
select
  p.id,
  s.id,
  tx->>'storeId',
  tx->>'type',
  tx->>'description',
  (tx->>'date')::date,
  tx->>'category',
  (tx->>'value')::numeric,
  coalesce((tx->>'isPaid')::boolean, false),
  tx->>'bankId',
  tx->'items'
from raw_tx r
cross join profile_sel p
left join all_stores s on s.external_id = tx->>'storeId';

