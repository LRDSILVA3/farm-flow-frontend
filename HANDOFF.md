# FarmFlow - Handoff Completo de Sessão

> **Data do Handoff:** 04/10/2026  
> **Status Geral:**  
> - ✅ **100% dos Cálculos e Regras Agronômicas Migrados** (`budget.xlsm`) com 0,00% de divergência  
> - ✅ **Backend 100% Ativo & Integrado ao PostgreSQL** (Docker container `postgres` na porta 5432)  
> - ✅ **22 Suítes / 97 Testes Aprovados no Backend** (`npm test` em `farm-flow-backend`)  
> - ✅ **13 Suítes / 37 Testes Aprovados no Frontend** (`npm test` em `farm-flow-frontend`)  
> - ✅ **Servidores Locais Operacionais:** Frontend em `http://localhost:8080` | Backend em `http://localhost:3333`

---

## 1. Visão Geral da Arquitetura & Infraestrutura

O projeto é constituído por dois repositórios irmãos:
```text
C:\Users\User\Documents\Projects\
  ├── farm-flow-frontend/   <-- React 18 + Vite + TypeScript + Tailwind/Radix UI
  └── farm-flow-backend/    <-- Node.js + Express + TypeORM + PostgreSQL + Vitest
```

### Banco de Dados & Docker
- O backend depende do **PostgreSQL** rodando no container Docker `postgres` na porta `5432`.
- O executável do Docker Desktop está localizado em:
  `C:\Users\User\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe`
- Caso a máquina seja reiniciada e o banco esteja indisponível:
  ```powershell
  # 1. Iniciar Docker Desktop (se fechado)
  Start-Process "C:\Users\User\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"
  # 2. Iniciar container do Postgres
  docker start postgres
  ```

---

## 2. Implementações Realizadas nesta Sessão (04/10/2026)

### A. Localidades (Cidades e Estados com Busca)
- **Componente:** `src/components/pages/farms/CityStateSelect.tsx`.
- **Funcionalidades:**
  - Contempla todos os 27 estados da federação brasileira (UF + Nome).
  - Popover com busca textual dinâmica (`search`) tanto para estados quanto para cidades.
  - Integração com a API do IBGE (`servicodados.ibge.gov.br`) com fallback imediato das principais praças agropecuárias (PR, MT, MS, GO, SP, RS, etc.) e cache em memória para navegação ultrarrápida.
  - Suporte à digitação customizada caso o município não conste na lista.

### B. Formulários e Validações (Clientes, Fazendas e Talhões)
- **Clientes (`CustomersForm.tsx`):**
  - Apenas o campo `name` é obrigatório, atendendo a pedidos rápidos de balcão onde só se possui o nome do produtor.
  - Validação inline conjunta: exibe todos os campos faltantes ou inválidos simultaneamente com destaque visual em vermelho.
- **Fazendas (`FarmForm.tsx`) e Talhões (`PlotForm.tsx`):**
  - Campos `Lote`, `Matrícula` e `Contato` padronizados como **opcionais**.
  - Ordem visual unificada em ambos os formulários: **Lote** sempre antes de **Matrícula**.
  - Eliminação de chamadas duplicadas `onSubmit(e)` e correção de fechamento indevido de modais sob erro.

### C. Formatação e Precisão de Áreas
- **Regra Estrita de Decimais:** Exibição com exatamente **2 casas decimais** (`.toFixed(2)`) para hectares (ha) e alqueires (alq) em todos os formulários, tabelas, modais e relatórios, eliminando dízimas periódicas.

### D. Pedidos, Cálculos em Tempo Real & Estabilidade
- **Fim da Oscilação Numérica:** Identificada e sanada a causa raiz do travamento/loop ao selecionar fazenda em `OrderForm.tsx`. O fluxo foi estabilizado através de memoização com `useCallback`, referências `useRef` para callbacks em formulários especializados e remoção do ping-pong de re-renderização.
- **Reset de Modais:** Aplicação de `key` dinâmica no `<form>` forçando remontagem e limpeza total de estado ao fechar e reabrir o modal de novo pedido.
- **Densidade Amostral Dinâmica:** Em `SoilSamplingServiceForm.tsx`, cálculo e exibição instantânea de **ha por ponto** ao digitar a quantidade de pontos.
- **Campos Condicionais:** Formulário de serviço avulso oculta automaticamente inputs genéricos quando nenhum serviço estiver selecionado.
- **Limpeza Visual:** Removidos todos os textos de referências diretas a planilhas (`*Sincronizado com budget.xlsm`, `(Conforme Excel)`, `(Conforme PEDIDO VIA CLIENTE)`).

### E. Agenda de Serviços & Execução de Campo (`SchedulePage.tsx`)
- **Exibição Concisa:** Equipe e equipamentos exibem os 2 primeiros itens e badge resumidor `+X` quando houver mais de dois alocados.
- **Rateio por Operador e Equipamento:** Suporte para detalhar quanto cada operador e máquina executou em hectares (ex: 40 ha total -> 20 ha Operador A com Trator 1, 20 ha Operador B com Trator 2), persistido na tabela `service_executions`.
- **Modal de Execução Inteligente:** Apresenta saldo restante em hectares e botões para **Salvar Execução Parcial** e **Salvar Total (Restante)**.
- **Fluxo de Conclusão para o Financeiro:** Conclusões de pedidos exigem ação explícita ("Concluir / Enviar ao Financeiro"), permitindo encerramento parcial com valor proporcional e nota justificativa registrada no histórico.
- **Filtros Completos:** Filtragem por Cliente, Fazenda, Serviço, Operador, Equipamento, Cidade, Estado, Status e busca textual.

### F. Gabarito Agronômico & Análises Laboratoriais
- **Definições Técnicas Oficiais Padronizadas:**
  - `MACRO+S+P_REM`: Análise **COMPLETA** da camada superficial (0-20 cm) – Macronutrientes + Enxofre + P-Remanescente.
  - `MACRO+S`: Análise em **PROFUNDIDADE** (20-40 cm) – Camada subsuperficial.
  - `MACRO`: Análise **SIMPLES** (somente fertilidade básica).
  - `ANALISE DE FOLIAR`: Análise de tecido foliar vegetal.
- **Importação na Agenda (`SchedulePage.tsx`):**
  - **Amostragem de Solo (AP):** Sugere automaticamente a quantidade total de pontos calculados na grade para `MACRO+S+P_REM` (ex: 41 amostras), 10% dos pontos para `MACRO+S` (ex: 4 amostras) e `0` para `MACRO` simples.
  - **Conferência de Amostragem:** Sugere automaticamente `10` amostras de `MACRO+S+P_REM` e `1` amostra de `MACRO+S`.
  - **Coleta Foliar:** Sugere `leafPoints` de `ANALISE DE FOLIAR`.
  - Se as quantidades forem alteradas manualmente, o sistema aplica automaticamente a etiqueta **"Quantidade Alterada (Comercial)"** para alertar o financeiro e o laboratório.
- **Módulo de Análises (`AnalysisPage.tsx` e `AnalysisModal.tsx`):** Tipos padronizados com rótulos explicativos e inclusão de análises em lote.

### G. Financeiro & Fluxo de Caixa (`FinancialPage.tsx`)
- **Máscara Monetária BRL:** Input de valor da baixa com máscara padrão brasileira (`.` milhar e `,` centavos) e botão rápido "Liquidar Saldo Total".
- **Cálculo de Saldo Residual:** Modal de baixa calcula e informa em tempo real quanto restará a pagar no pedido.
- **Aba Lançamentos (Entradas & Saídas):** Integrado `FinancialTransactionsTab.tsx` para gestão de fluxo de caixa operacional com categorias personalizadas, datas de vencimento/pagamento e status.
- **Sincronização Automática:** Ao confirmar a baixa de um pedido, é gerado automaticamente um lançamento de entrada no fluxo de caixa.

### H. Configurações, Equipamentos & RBAC
- **Cabeçalho de PDFs:** Adicionada aba **Cabeçalho de PDFs** (`PdfHeaderTab.tsx`) para configuração corporativa de logo, dados fiscais e rodapé.
- **Equipamentos (`EquipmentsTab.tsx`):** Tabela alinhada com as novas colunas Tipo (`Veículo`, `Ferramenta`, `Outro`) e Placa / Número de Série.
- **Catálogo Oficial:** Removidos serviços legados (`pulverização` legado, `plantio`, `colheita`, `adubação`) em `usePlan.ts`, alinhando aos 8 serviços oficiais da empresa.
- **RBAC (Permissões):** Perfis estruturados no `UserModal.tsx` e `useUser.ts` (Administrador, Gerente, Operador de Campo, Financeiro, Analista) com pré-preenchimento inteligente de permissões.
- **Relatórios (`ReportsPage.tsx`):** Consolidação de produtividade por operador, uso de maquinário, volume por serviço e regionalização por cidade/estado com exportação em CSV.

---

## 3. Estado dos Testes e Validação

### Frontend (`farm-flow-frontend`)
- **Comando:** `$env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH; npm test -- --run`
- **Status:** **13 suítes | 37 testes passando | 0 falhas**

### Backend (`farm-flow-backend`)
- **Comando:** `$env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH; npm --prefix "..\farm-flow-backend" test`
- **Status:** **22 suítes | 97 testes passando | 0 falhas**

---

## 4. Procedimentos de Inicialização do Ambiente

Sempre que reiniciar o terminal ou abrir uma nova sessão:

```powershell
# 1. Configurar Node v20 via NVM no PATH
$env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;

# 2. Garantir que o container do Postgres está ativo
docker start postgres

# 3. Iniciar o Backend (porta 3333)
npm --prefix "..\farm-flow-backend" run dev

# 4. Iniciar o Frontend (porta 8080)
npm run dev
```

---

## 5. Próximos Passos Sugeridos

1. **Geração Direta de PDF via Servidor:**
   - Adicionar geração direta de arquivos `.pdf` para o relatório consolidado e para a folha oficial de pedido (`OrderPrintDialog.tsx`) utilizando Puppeteer ou `jsPDF`/`html2pdf`.
2. **Auditoria de Histórico de Pedidos:**
   - Criar timeline visual registrando quem aprovou, editou, cancelou ou registrou rateios e baixas parciais.
3. **Módulo de Estoque de Insumos & Amostras:**
   - Controle de sacarias, caixas térmicas e reagentes químicos vinculados aos serviços de amostragem.
