# Backlog de Tarefas

## 🚀 Prioridade Alta (Bugs, Validações e Reset de Modais)
- [x] **Reset de Modais:** Garantir reset rigoroso de estado ao abrir e fechar modais no sistema (Novo Pedido, Nova Execução, Nova Análise, Novo Cliente).
- [x] **Estabilidade Pedidos:** Corrigir travamento e oscilação descontrolada de valores ao trocar fazenda/área em `OrderForm.tsx`.
- [x] **Formatação Decimais:** Exibir estritamente 2 casas decimais para hectares e alqueires em todos os formulários e tabelas.
- [x] **Validação Cliente:** Formulário de cliente deve ter apenas `Nome` como obrigatório e exibir todos os erros de validação juntos na tela.
- [x] **Validação Fazenda & Talhão:** Tornar opcionais lote, matrícula e contato em Fazenda; opcionais matrícula e lote em Talhão; padronizar ordem (Lote antes de Matrícula).
- [x] **Limpeza Visual Pedidos:** Remover texto `*Sincronizado com budget.xlsm (INPUT DADOS / PEDIDO VIA CLIENTE)` e rótulos do Excel em pedidos.
- [x] **Densidade de Amostragem:** Mostrar cálculo em tempo real de `ha por ponto` ao informar o número de pontos de amostragem.
- [x] **Inputs Condicionais Pedido:** Ocultar inputs de serviço genérico quando nenhum serviço avulso estiver selecionado.
- [x] **Conversão ALQ vs HA no Pedido e Orçamento:** Sincronizar alqueires digitados no modal (`SoilSamplingServiceForm.tsx`) com a área do pedido em hectares, e corrigir a Folha de Pedido (`OrderPrintDialog.tsx`) para usar os alqueires corretos e fórmulas de `budget.xlsm`, eliminando confusão de unidades e descontos comerciais fantasmas.
- [x] **Download Direto em PDF:** Adicionado botão de download instantâneo de `.pdf` oficial na Folha de Pedido (`OrderPrintDialog.tsx`) utilizando `jsPDF` e `html2canvas`.

## 📅 Agenda de Serviços e Execução de Campo
- [x] **Equipe & Equipamentos:** Exibir os 2 primeiros itens e badge `+X` quando houver mais de dois na tabela da Agenda e de Pedidos.
- [x] **Rateio de Execuções:** Permitir detalhar quanto cada operador e equipamento executou do serviço (ex: 40 ha total -> 20 ha Almir com Trator X, 20 ha Maicon com Trator Y).
- [x] **Colunas da Agenda:** Incluir colunas Cidade, Estado e indicador claro de "Quanto já foi executado" (ha e %).
- [x] **Modal de Execução:** Trazer automaticamente saldo restante em ha, com botões para "Salvar Execução Total" ou "Parcial".
- [x] **Fluxo de Conclusão para o Financeiro:** Pedido 100% executado não vai automaticamente para o financeiro; implementar botão "Concluir / Enviar ao Financeiro" com suporte a Conclusão Parcial (valor proporcional com edição e nota no histórico).
- [x] **Filtros da Agenda:** Adicionar filtros por Cliente, Fazenda, Tipo de Serviço, Operador, Equipamento, Cidade, Estado, Status e Busca geral.

## 💰 Financeiro & Lançamentos de Fluxo de Caixa
- [x] **Máscara Monetária na Baixa:** Melhorar input de valor da baixa com máscara padrão BRL (`.` milhar e `,` centavos).
- [x] **Baixa Parcial:** Permitir baixa parcial mostrando em tempo real o saldo que restará a pagar.
- [x] **Aba Lançamentos (Entradas & Saídas):** Integrar `FinancialTransactionsTab.tsx` no `FinancialPage.tsx` com categorias customizadas e controle de datas a pagar/receber e pagas/recebidas.
- [x] **Geração Automática de Entrada:** Ao confirmar baixa de pedido, gerar lançamento automático de entrada no fluxo de caixa.
- [x] **Filtros Financeiro:** Adicionar filtros por cliente, fazenda, tipo de serviço, status de pagamento e período.

## 🔬 Análises Laboratoriais
- [x] **Inclusão Direta da Agenda:** Botão "Incluir Análises" na Agenda puxando sugestão da planilha/pedido, permitindo editar quantidades e aplicando etiqueta para o financeiro em caso de alteração.
- [x] **Modal de Análises em Lote:** Permitir incluir quantidades diretamente por tipo de análise no modal, sem necessidade de reabrir várias vezes.
- [x] **Tipos Oficiais Padronizados:** Substituir input de texto por seleção dos tipos oficiais: `MACRO`, `MACRO+S`, `MACRO+S+P_REM` e `ANALISE DE FOLIAR`.
- [x] **Cálculo Fiel de Quantidade de Análises (`budget.xlsm`):** Mensuração exata de quantidades de análises para Conferência (Macro 0-20cm, 20-40cm e Física), Agricultura de Precisão (curva cúbica de distribuição Completa vs Macro Simples conforme desconto do orçamento, mais 20-40cm e Física) e Coleta Foliar (pontos foliares), com extração direta do pedido e recálculo dinâmico na Agenda.
- [x] **Gabarito Editável de Análises (`SoilSamplingServiceForm.tsx`):** Permitir digitação e edição livre das quantidades de análises da distribuição (Completa 0-20cm, Macro Simples, 20-40cm e Física) com vínculo dinâmico da planilha Excel (`B22 = B6 - B21`: reduzir Completa aumenta Macro automaticamente, e Completa + Macro não pode exceder a quantidade de pontos), com recalculo em tempo real e sincronização de produtos.

## ⚙️ Configurações, Serviços, Equipamentos & Relatórios
- [x] **Filtros e Busca em Configurações Operacionais:** Adicionados campos de busca em tempo real e filtros suspensos em todas as 7 abas de Configurações Operacionais (`Variáveis de Custo`, `Equipamentos`, `Serviços`, `Produtos`, `Colaboradores`, `Análises`, `Grupos de Serviços`), com paginação dinâmica sobre resultados filtrados, ordenação e botão para limpar filtros.
- [x] **Variáveis de Custo:** Adicionar tags visíveis indicando em quais serviços cada variável está sendo utilizada.
- [x] **Limpeza de Serviços Antigos:** Remover serviços legados (`pulverização` legado, `plantio`, `colheita`, `adubação`).
- [x] **Grupos de Serviços:** Permitir vincular todos os serviços oficiais originados da planilha no módulo Grupo de Serviços.
- [x] **Equipamentos:** Adicionar campo `tipo` (Veículo, Ferramenta, Outro) com campos opcionais condicionais (placa, ano, km / número de série, horímetro) e corrigir colunas da tabela.
- [x] **Personalização Cabeçalho PDFs:** Integrar aba no módulo de Configurações para personalizar cabeçalho dos PDFs (logo, dados da empresa, rodapé).
- [x] **Revisão de Permissões (RBAC):** Revisar e alinhar permissões dos usuários (Administrador, Gerente, Operador, Financeiro).
- [x] **Relatórios:** Consolidar tela de relatórios com produtividade por operador, uso de maquinário e volume executado por serviço.

## 🔄 Concluídos Anteriores
- [x] Motores de Cálculo do Excel Migrados (`budget.xlsm`) com 0,00% de divergência.
- [x] Backend 100% Replicado com JWT, TypeORM e PostgreSQL.
- [x] Testes Unitários de Serviços (13 suites, 37 testes passando no frontend; 22 suites, 89 testes no backend).