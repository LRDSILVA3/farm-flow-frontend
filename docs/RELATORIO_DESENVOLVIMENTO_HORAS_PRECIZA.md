# Relatório de Desenvolvimento de Software — NewFeel
**Desenvolvido por:** NewFeel (Desenvolvimento de Software — https://newfeel.netlify.app/)  
**Cliente Contratante:** Preciza — Agricultura de Precisão  
**Projeto:** FarmFlow — Sistema de Gestão Operacional, Orçamentária e Financeira  
**Período:** Desenvolvimento e Implantação  
**Data:** 13 de Novembro de 2026  

---

## 1. Resumo Financeiro e Horas Investidas

| Indicador | Detalhe |
| :--- | :--- |
| **Total de Horas Trabalhadas** | **126 horas** |
| **Valor da Hora Técnica** | **R$ 70,00 / hora** |
| **Investimento Total Acumulado** | **R$ 8.820,00** |
| **Status das Entregas** | **100% Funcional e Homologado em Servidor** |

---

## 2. Discriminação das Horas por Módulo e Entrega

| Item | Módulo / Funcionalidade Entregue | Descrição das Atividades e Valor de Negócio | Horas | Subtotal (R$) |
| :---: | :--- | :--- | :---: | :---: |
| **01** | **Modelagem de Dados e Arquitetura do Sistema** | Estruturação de banco de dados relacional (PostgreSQL), criação de tabelas, relacionamentos (clientes, fazendas, talhões, orçamentos, itens, parcelas financeiras e auditoria), rotas de API seguras em Node.js/TypeScript e esqueleto de interface moderna em React/Tailwind. | **14h** | R$ 980,00 |
| **02** | **Cadastros Agrícolas Inteligentes (Clientes, Fazendas e Talhões)** | Cadastro completo de produtores e propriedades rurais com suporte a múltiplos talhões; integração automática com base de Estados e Cidades do IBGE; conversão bidirecional automática e precisa entre **Hectares (ha)** e **Alqueires** (Paulista/outros) com tratamento de casas decimais. | **16h** | R$ 1.120,00 |
| **03** | **Motor de Cálculos Agronômicos Especializados** | Engenharia reversa e implementação integral em código das fórmulas e regras operacionais da planilha oficial da Preciza (`budget.xlsm`). Suporte completo a 8 modalidades de serviço com precificação automática por área, insumos e deslocamento: <br>• Amostragem de Solo (AP) com grid e amostras<br>• Drone de Pulverização (ha/alq, calda e tempo)<br>• Drone de Mapeamento (Ortomosaicos)<br>• Aplicação Foliar<br>• Conferência e Validação de Lavoura<br>• Compactação de Solo<br>• Serviços com ATV (Quadriciclo)<br>• Equaliza / Correção de Solo. | **32h** | R$ 2.240,00 |
| **04** | **Módulo Comercial e Geração da Folha de Pedido em PDF** | Fluxo de emissão, revisão e aprovação de orçamentos; conversão direta de orçamentos aprovados em pedidos de serviço; geração automatizada do PDF oficial da **Folha de Pedido Preciza**, com layout timbrado, detalhamento de área/serviços, formas de pagamento e campo para assinatura formal do cliente. | **18h** | R$ 1.260,00 |
| **05** | **Agenda Operacional de Campo e Execuções Parciais** | Painel da agenda de serviços com filtros combinados (cliente, fazenda, operador, equipamento, status); controle de execuções parciais em tempo real (área realizada vs. área pendente com barra de progresso visual); apontamento e rateio de horas/área executada por operador e equipamento para cálculo de produtividade de campo. | **18h** | R$ 1.260,00 |
| **06** | **Módulo Financeiro e Fluxo de Recebíveis** | Geração automática de contas a receber a partir da aprovação dos pedidos; gestão de parcelamento e datas de vencimento; registro de liquidações e baixas com suporte a múltiplas formas de pagamento (PIX, Boleto, Cheque, Transferência); controle de recebimentos pendentes, parciais e quitados. | **14h** | R$ 980,00 |
| **07** | **Segurança, Perfis de Acesso e Trilha de Auditoria** | Controle de permissões baseado em níveis de acesso (Administrador, Agrônomo/Consultor e Operador de Campo); registro de auditoria completo (rastreamento de quem criou, editou ou alterou qualquer dado sensível no sistema); autenticação segura e proteção de dados. | **8h** | R$ 560,00 |
| **08** | **Conteinerização Docker, Homologação e Deploy em Servidor** | Configuração de containers Docker (Backend, Frontend e Banco de Dados) para execução isolada e confiável; validação de testes operacionais ponta a ponta e implantação no servidor dedicado para acesso da equipe na rede. | **6h** | R$ 420,00 |
| **TOTAL** | **Consolidado Geral de Desenvolvimento** | **8 Módulos Completos Entregues e Operacionais** | **126h** | **R$ 8.820,00** |

---

## 3. Distribuição Percentual das Horas

```
[████████████████████████] 25,4% Motor de Cálculos Agronômicos (32h)
[█████████████]           14,3% Agenda Operacional e Execuções (18h)
[█████████████]           14,3% Comercial e PDF Oficial (18h)
[████████████]            12,7% Cadastros Agrícolas (Clientes/Fazendas/Talhões) (16h)
[██████████]              11,1% Arquitetura e Modelagem de Dados (14h)
[██████████]              11,1% Módulo Financeiro e Recebíveis (14h)
[██████]                   6,3% Segurança e Auditoria (8h)
[████]                     4,8% Deploy e Homologação Docker (6h)
-------------------------------------------------------------------------
Total: 100,0% (126 horas)
```
