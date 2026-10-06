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
- [x] **Medida Dupla em Alqueires e Hectares (Fazenda e Talhão):** Implementada opção de inserir medidas tanto em Hectares (ha) quanto em Alqueires (alq) nos formulários de criação e edição de Fazendas (`FarmForm.tsx`) e Talhões (`PlotForm.tsx`) com recálculo bidirecional automático em tempo real (`1 alq = 2,42 ha`), validação rigorosa de 2 casas decimais ao salvar e carregar, suporte a `updatePlot` no hook e exibição de ambas as unidades nas tabelas, eliminando qualquer divergência de arredondamento (como 20 alq virando 19 e pouco).
- [x] **Correção do Erro React #310 e Radix Dialog Description:** Eliminada a quebra de Regras dos Hooks (Minified React error #310) em `OrderPrintDialog.tsx` (onde o hook `useState(isGeneratingPdf)` era declarado condicionalmente após `if (!order) return null;`), reposicionando todos os hooks no topo do componente. Implementados elementos `<DialogDescription className="sr-only">` em todos os modais (`OrderPrintDialog`, `FarmForm`, `OrderForm`, `AddPlotModal`, `PlotsModal`, `OrderExecutionDialog`, `OrderPaymentDialog`), eliminando os avisos de acessibilidade do Radix Dialog.
- [x] **Acesso Externo & Manual Ilustrado do Usuário:** Habilitado proxy reverso no Nginx do frontend para integração transparente de rotas da API em link único. Subido túnel Cloudflare seguro (`https://statistical-institutes-wood-somehow.trycloudflare.com`) e elaborado manual ilustrado completo do usuário (`MANUAL_DO_USUARIO.md`) com telas reais, modais e fluxos operacionais em linguagem comercial/agronômica para envio ao cliente.
- [x] **Ajustes de Interface, Remoção de 'Condutividade Elétrica' & Correção de Telas do Manual:** Corrigido 'Novo Client' para 'Novo Cliente' no formulário (`CustomersForm.tsx`); constatado que 'Condutividade Elétrica' não existe na planilha `budget.xlsm` e foi excluído do PostgreSQL, seeds do backend e `ServiceGroupModal.tsx`; gerada captura renderizada e nítida da tela de login (`01_tela_login.png`) substituindo a imagem branca no manual; adicionada rota `/login` no frontend; e removida a Seção 12 (Suporte e Contato) da documentação do cliente.
- [x] **Rotina de Backup Automático Noturno no HD de 2TB:** Identificado e montado persistentemente o disco de 2TB (`/dev/sdd`, UUID `abc067b1-4b1f-4794-ad81-78f4655153a9`) em `/mnt/backup_2tb` via `/etc/fstab`. Desenvolvido script de backup em `/usr/local/bin/farmflow_backup.sh` com dump compactado do PostgreSQL (`farmflow-postgres`), tarball de códigos/configurações/`.env`, retenção rotativa de 30 dias e agendamento automático via Cron (`/etc/cron.d/farmflow_backup`) para execução diária às 03:00 da manhã com logs detalhados.

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
- [x] Deploy do Backend Dockerizado no Servidor Local (HP sv1 - `192.168.1.20:3333`) com PostgreSQL 15, migrations TypeORM automáticas e seeds de variáveis e serviços oficiais executados.
- [x] Deploy do Frontend Dockerizado no Servidor Local (HP sv1 - `192.168.1.20:3000`) com Nginx Alpine, roteamento SPA e conexão direta com a API do servidor (`192.168.1.20:3333`).
- [x] Identidade Visual Preciza: Favicon SVG e ICO oficiais aplicados, metadados do Lovable removidos de `index.html`.
- [x] Correção de Erro 500 em `/orders`: Migration `AddOrderFieldsEquipmentFieldsAndTransactions` executada, sincronizando colunas faltantes em `orders` (`executions`, `schedules`, etc.), `equipment` e tabelas financeiras/execuções.
- [x] Compatibilidade HTTP/LAN: Polyfill global e utilitário `generateUUID` implementados para resolver `crypto.randomUUID is not a function` em acessos via IP de rede local não seguro (`http://192.168.1.20:3000`).
- [x] Correção de Gabarito Inicial de Amostragem (AP): Corrigido vazamento de estado onde novo pedido inicializava com Completa travada em 1 e restante em Macro; agora reflete 100% de Análise Completa sugerida pela planilha `budget.xlsm` (sem botões de reverter indevidos).