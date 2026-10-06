# FarmFlow - Handoff Completo de Sessão

> **Data do Handoff:** 06/10/2026  
> **Status Geral:**  
> - ✅ **Deploy no Servidor HP Local Concluído:** Backend (`http://192.168.1.20:3333`) | Frontend (`http://192.168.1.20:3000`) | PostgreSQL 15 (`5432`)
> - ✅ **100% dos Motores de Cálculo Agronômico Migrados e Sincronizados** (`budget.xlsm`)
> - ✅ **Gabarito de Amostragem Alinhado à Planilha:** Sem desconto, 100% dos pontos são Análise Completa (0-20cm) e Macro Simples inicia estritamente em ZERO (0)
> - ✅ **Medida Dupla de Área (ha e alq):** Fazendas e Talhões com recálculo bidirecional instantâneo (`1 alq = 2,42 ha`) e rigor de 2 dígitos decimais
> - ✅ **Compatibilidade HTTP/LAN:** Polyfill global de `crypto.randomUUID` para redes locais não seguras
> - ✅ **Identidade Visual Preciza:** Favicon oficial SVG/ICO e limpeza de metadados do Lovable
> - ✅ **Testes Unitários:** Suítes de testes cobrindo recálculo bidirecional de áreas, serviços de orçamento e modais

---

## 1. Visão Geral da Arquitetura & Infraestrutura

O sistema opera em produção/homologação no **Servidor Local HP (`sv1` - IP: `192.168.1.20`)** e possui ambiente de desenvolvimento local:

```text
Ambiente Local (Desenvolvimento):
C:\Users\User\Documents\Projects\
  ├── farm-flow-frontend/   <-- React 18 + Vite + TypeScript + Tailwind/Radix UI
  └── farm-flow-backend/    <-- Node.js + Express + TypeORM + PostgreSQL + Vitest

Servidor HP Local (Produção/Rede Local - sv1):
  ├── farmflow-backend     <-- Container Docker na porta 3333
  ├── farmflow-frontend    <-- Container Docker Nginx Alpine na porta 3000
  └── postgresql-db        <-- PostgreSQL 15 na porta 5432
```

### Serviços e Endpoints no Servidor HP (`192.168.1.20`):
- **Frontend Web:** `http://192.168.1.20:3000` (Nginx Alpine com roteamento SPA configurado em `try_files $uri $uri/ /index.html`)
- **Backend API:** `http://192.168.1.20:3333`
- **Banco de Dados:** PostgreSQL 15 na porta `5432` (banco `farmflow`)
- **Acesso SSH:** `sv1@192.168.1.20`

---

## 2. Implementações Realizadas Recentemente (06/10/2026)

### A. Medida Dupla em Alqueires e Hectares (Fazendas e Talhões)
- **Componentes:** [`FarmForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/FarmForm.tsx) e [`PlotForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/PlotForm.tsx).
- **Recálculo Bidirecional em Tempo Real:**
  - O usuário pode preencher tanto **Hectares (ha)** quanto **Alqueires (alq)**.
  - Ao digitar em Alqueires (ex: `20`): calcula e preenche automaticamente os Hectares com precisão (`20 × 2,42 = 48.40 ha`).
  - Ao digitar em Hectares (ex: `48.40`): calcula e preenche automaticamente os Alqueires (`48.40 ÷ 2,42 = 20.00 alq`).
- **Resolução do Bug "20 alq virava 19 e pouco":**
  - **Causa Raiz:** O sistema não possuía input de alqueires; ao digitar `48 ha` (aproximação mental de 2,4), a divisão por `2,42` resultava em `19,83 alqueires`. Além disso, valores da API vinham sem formatação fixa de decimais.
  - **Correção:** Garantida formatação estrita de 2 casas decimais (`.toFixed(2)`) ao digitar (`onBlur`), ao salvar na API e ao mapear retornos do banco (`mapFarmFromDB` e `mapPlotFromDB` em [`useFarms.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/hooks/useFarms.ts)).
- **Tabelas de Fazendas e Talhões:** [`FarmTable.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/FarmTable.tsx) e [`PlotsTable.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/PlotsTable.tsx) agora exibem ambas as medidas formatadas: `48.40 ha (20.00 alq)`.
- **Persistência de Edição de Talhões:** Adicionado método `updatePlot` no hook `useFarms` e no `usePlotHandlers` consumindo a rota `PUT /farms/plots/:plot_id` do backend.
- **Área da Fazenda no Pedido ([`OrderForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderForm.tsx)):** Fallback automático para a área total da fazenda com 2 casas decimais quando ela ainda não possui talhões cadastrados ou quando "todos" estiver selecionado.

### B. Correção do Gabarito de Amostragem de Solo (AP)
- **Fidelidade à Planilha `budget.xlsm` (`INPUT DADOS` B17, B21, B22, I25):**
  - Sem desconto comercial, **100% dos pontos superficiais são Análise Completa (0-20cm)** (`B21 = B6`).
  - **Macro Simples (B22 = B6 - B21) inicia rigorosamente em ZERO (0)**. A Macro Simples só deve ser maior que zero em caso de desconto comercial negociado ou edição manual no gabarito.
  - Salvaguarda adicionada em [`SoilSamplingService.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/services/SoilSamplingService.ts) garantindo `percAnalisesCompleta = 100` e `numAnalisesMacro = 0` sempre que `desconto <= 0`.
- **Eliminação de Vazamento de Estado em Novo Pedido:**
  - Corrigido vazamento em [`SoilSamplingServiceForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/SoilSamplingServiceForm.tsx) onde o estado provisório inicial de 1 ponto (1 Completa) era salvo em `productsData` do pedido e interpretado como override manual ao digitar a área real (gerando 1 Completa e 16 Macro). Novos pedidos agora iniciam limpos e sincronizados com a planilha.

### C. Deploy e Estabilização do Backend no Servidor HP
- **Banco de Dados & Migrations:**
  - Executada migration `AddOrderFieldsEquipmentFieldsAndTransactions1790856601753` no PostgreSQL do servidor.
  - Criadas colunas faltantes em `orders` (`executions`, `schedules`, `payments`, `logs`, `executed_area`, `paid_amount`) e `equipment` (`serial_number`, `hourmeter`, `year`, `notes`).
  - Criadas tabelas operacionais `service_executions` e `financial_transactions`.
  - Corrigido o erro HTTP 500 no endpoint `GET /orders`.
- **Seeds Oficiais:**
  - Executados seeds TypeORM no servidor cadastrando o usuário admin padrão, os 8 serviços oficiais validados e todas as variáveis de custo agronômico.

### D. Compatibilidade com HTTP e Rede Local (Polyfill de UUID)
- **Problema:** Em conexões HTTP não seguras (como o IP local `http://192.168.1.20:3000`), navegadores modernos desativam `crypto.randomUUID`.
- **Solução:** Implementado polyfill global em `src/main.tsx` e função utilitária `generateUUID()` em `src/lib/utils.ts` compatível com a especificação RFC4122 v4.

### E. Identidade Visual da Preciza
- **Favicon Oficial:** Substituídos todos os ícones Lovable pelos arquivos SVG e ICO oficiais da Preciza Tecnologia no `index.html`.
- **Metadados Limpos:** Título e metadados atualizados para "Preciza - Gestão Agronômica".

---

## 3. Estado dos Testes e Validação

### Frontend (`farm-flow-frontend`)
- **Comandos:**
  ```powershell
  $env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;
  npm test -- --run
  ```
- **Status:** **Suítes de testes passando sem regressões**, incluindo testes de recálculo bidirecional em `FarmForm.spec.tsx` e `PlotForm.spec.tsx`.

### Backend (`farm-flow-backend`)
- **Comando:**
  ```powershell
  $env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;
  npm --prefix "..\farm-flow-backend" test
  ```
- **Status:** **22 suítes | 97 testes passando | 0 falhas**

---

## 4. Como Executar e Atualizar o Sistema

### A. Rodar Localmente (Desenvolvimento)
```powershell
# 1. Configurar Node v20 via NVM no PATH
$env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;

# 2. Iniciar container do Postgres local
docker start postgres

# 3. Iniciar Backend (porta 3333)
npm --prefix "..\farm-flow-backend" run dev

# 4. Iniciar Frontend (porta 8080)
npm run dev
```

### B. Atualizar o Servidor HP Local (`192.168.1.20`)
```powershell
# Acessar via SSH
ssh sv1@192.168.1.20

# Atualizar Frontend:
cd ~/farm-flow-frontend
git pull origin main
docker build -t farm-flow-frontend:latest .
docker stop farmflow-frontend && docker rm farmflow-frontend
docker run -d --name farmflow-frontend -p 3000:80 --restart unless-stopped farm-flow-frontend:latest

# Atualizar Backend (se houver mudanças):
cd ~/farm-flow-backend
git pull origin main
npm run build
docker restart farmflow-backend
```

---

## 5. Próximos Passos Sugeridos

1. **Geração Direta de PDF nos Relatórios:**
   - Adicionar botão de exportação em PDF estruturado também nos Relatórios de Produtividade (`ReportsPage.tsx`).
2. **Timeline de Auditoria de Pedidos:**
   - Exibir na aba de detalhes do pedido uma linha do tempo com o histórico de alterações (criação, agendamento, execução parcial e liquidação financeira).
3. **Controle de Estoque Físico de Amostras:**
   - Rastreamento dos números de lacres e caixas de amostras de solo e foliar despachadas para o laboratório.
