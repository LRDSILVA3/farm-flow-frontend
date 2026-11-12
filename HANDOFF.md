# FarmFlow - Handoff Completo de Sessão

> **Data do Handoff:** 11/11/2026 (commits `a46689b` no backend e `a10c861` no frontend)  
> **Status Geral:**  
> - ✅ **Deploy no Servidor HP Local Concluído:** Backend (`http://192.168.1.20:3333`) | Frontend (`http://192.168.1.20:3000`) | PostgreSQL 15 (`5432`)
> - ✅ **100% dos Motores de Cálculo Agronômico Migrados e Sincronizados** (`budget.xlsm`)
> - ✅ **Gabarito de Amostragem Alinhado à Planilha:** Sem desconto, 100% dos pontos são Análise Completa (0-20cm) e Macro Simples inicia estritamente em ZERO (0)
> - ✅ **Medida Dupla de Área (ha e alq):** Fazendas e Talhões com recálculo bidirecional instantâneo (`1 alq = 2,42 ha`) e rigor de 2 dígitos decimais
> - ✅ **Compatibilidade HTTP/LAN:** Polyfill global de `crypto.randomUUID` para redes locais não seguras
> - ✅ **Identidade Visual Preciza:** Favicon oficial SVG/ICO e limpeza de metadados do Lovable
> - ✅ **RBAC & Permissões Persistentes:** Controle por módulo no PostgreSQL, rotas protegidas por `ensurePermission` e interface dinâmica conforme usuário logado
> - ✅ **Auditoria Completa de Pedidos & Sistema (`audit_logs`):** Diffs `Antes → Depois` em pedidos (`OrderHistoryDialog`) e trilha global imutável (`AuditLogsPanel`)
> - ✅ **Testes Unitários & E2E:** Backend com **26 suítes / 120 testes** e Frontend com **18 suítes / 59 testes** passando + validação E2E Playwright

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

### C. Correção de Erros de Execução no Frontend (React Error #310 e Radix Dialog Description)
- **Minified React error #310 (Quebra das Regras dos Hooks):**
  - **Causa Raiz:** Em [`OrderPrintDialog.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderPrintDialog.tsx), o hook `const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);` estava posicionado após a verificação condicional `if (!order) return null;`. Quando `order` alternava entre `null` e o pedido selecionado (ao clicar no botão de impressão), o número de hooks invocados pelo componente variava entre renders, violando a regra fundamental do React e travando a renderização com o erro `#310`.
  - **Correção:** O hook `useState` de `isGeneratingPdf` foi realocado para o topo do componente junto com os demais hooks (`useState`, `useMemo`, `useEffect`), garantindo execução incondicional em todas as renderizações.
- **Warning de Acessibilidade Radix UI (`Missing Description or aria-describedby={undefined} for {DialogContent}`):**
  - **Causa Raiz:** Modais baseados no Radix Dialog emitiam aviso no console por não possuírem elemento `<DialogDescription>` associado ao `<DialogContent>`.
  - **Correção:** Adicionado `<DialogDescription className="sr-only">` em todos os modais da aplicação ([`OrderPrintDialog.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderPrintDialog.tsx), [`FarmForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/FarmForm.tsx), [`OrderForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderForm.tsx), [`AddPlotModal.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/AddPlotModal.tsx), [`PlotsModal.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/farms/PlotsModal.tsx), [`OrderExecutionDialog.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderExecutionDialog.tsx), [`OrderPaymentDialog.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderPaymentDialog.tsx)), eliminando o warning sem impacto visual.

### D. Deploy e Estabilização do Backend no Servidor HP
- **Banco de Dados & Migrations:**
  - Executada migration `AddOrderFieldsEquipmentFieldsAndTransactions1790856601753` no PostgreSQL do servidor.
  - Criadas colunas faltantes em `orders` (`executions`, `schedules`, `payments`, `logs`, `executed_area`, `paid_amount`) e `equipment` (`serial_number`, `hourmeter`, `year`, `notes`).
  - Criadas tabelas operacionais `service_executions` e `financial_transactions`.
  - Corrigido o erro HTTP 500 no endpoint `GET /orders`.

### E. Acesso Remoto Seguro (Túnel Cloudflare), Proxy Nginx & Manual do Usuário
- **Acesso Online Unificado (Túnel Cloudflare):**
  - Subido container `farmflow-tunnel` expondo o frontend via URL pública segura (`https://remedies-triangle-renewable-respond.trycloudflare.com`).
  - Nginx configurado para fazer proxy reverso automático de todas as rotas da API (`/sessions`, `/users`, `/clients`, `/orders`, etc.) para o backend (`http://farmflow-backend:3333`) na rede Docker interna (`farm-flow-backend_default`).
  - `src/services/api.ts` e `docker-compose.yml` ajustados para usar rotas relativas (`""`) em produção, eliminando erros de *Mixed Content* e permitindo login e uso de qualquer rede externa ou celular.
- **Limpeza de Serviços & Ajustes de Interface:**
  - Corrigido rótulo de "Novo Client" para "Novo Cliente" no formulário de produtores.
  - Constatado que o serviço "Condutividade Elétrica" não existia na planilha `budget.xlsm` (serviço teste com 0 pedidos) e removido do PostgreSQL, dos seeds do backend e do catálogo padrão.
- **Manual do Usuário Ilustrado:**
  - Recapturadas todas as 16 telas e modais com layout renderizado e dados fiéis em produção (`docs/screens/`).
  - Gerado `MANUAL_DO_USUARIO_PRECIZA.pdf` e `docs/MANUAL_DO_USUARIO_PRECIZA.html` completos para apresentação ao cliente.
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

### Status dos Testes Atualizado (10/11/2026)
- **Frontend (`farm-flow-frontend`):**
  ```powershell
  $env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;
  npm test -- --run
  ```
  - **Status:** **18 suítes | 59 testes passando | 0 falhas** + `npx tsc --noEmit` + `npm run build` (`vite build`) OK (incluindo `AuditLogsPanel.spec.tsx`, `OrderHistoryDialog.spec.tsx`, `UsersSection.spec.tsx`, `permissions.spec.ts`, `FarmForm.spec.tsx` e `PlotForm.spec.tsx`).

- **Backend (`farm-flow-backend`):**
  ```powershell
  $env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;
  npm --prefix "..\farm-flow-backend" test
  ```
  - **Status:** **26 suítes | 120 testes passando | 0 falhas** + `npm run build` (`tsc`) OK (incluindo `AuditLogService.spec.ts`, `orderAudit.spec.ts`, `ensurePermission.spec.ts` e `UsersController.spec.ts`).

### Atualizações de 10/11/2026 (Commits `a46689b` Backend / `a10c861` Frontend)

#### F. Padronização de Modais e Ajustes de Pedidos
- Criação/edição de Clientes (`CustomersForm.tsx`), Fazendas, Talhões (`PlotForm.tsx` / `PlotsModal.tsx`) e Usuários (`UserModal.tsx`) padronizadas em `<Dialog>` modais, eliminando formulários inline.
- Corrigida validação HTML5 em [`SoilSamplingServiceForm.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/SoilSamplingServiceForm.tsx) adicionando `step="any"` no campo `Área em Alqueires` para aceitar áreas fracionárias convertidas de hectares (ex.: `62.19`).

#### G. Permissões de Usuários (RBAC Persistente)
- **Migrations & Backend:** `1790856601754-AddUserPermissionsAndStatus.ts` (`phone`, `status`, `permissions` jsonb em `users`), endpoint `GET /sessions/me`, bloqueio de usuários `Inativo` no login/sessão e middleware [`ensurePermission.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-backend/src/shared/http/middlewares/ensurePermission.ts) em todas as rotas da API.
- **Frontend:** [`permissions.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/constants/permissions.ts), [`useAuth.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/hooks/useAuth.ts), [`MainLayout.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/MainLayout.tsx) e [`useUser.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/settings/useUser.ts) salvando e aplicando permissões reais por módulo (ocultando menus/atalhos não autorizados e impedindo autoexclusão/auto-inativação do próprio usuário).

#### H. Auditoria Completa de Pedidos e Trilha Global (`audit_logs`)
- **Migrations & Backend:** `1790856601755-CreateTableAuditLogs.ts` e `1790856601756-AlterAuditLogsCreatedAtTimestamptz.ts` (`created_at TIMESTAMPTZ`), módulo `audit` ([`AuditLog.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-backend/src/modules/audit/typeorm/entities/AuditLog.ts), [`AuditLogService.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-backend/src/modules/audit/services/AuditLogService.ts), [`audit.routes.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-backend/src/modules/audit/routes/audit.routes.ts)) e [`orderAudit.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-backend/src/modules/orders/utils/orderAudit.ts) gerando diffs `Antes → Depois` em `orders.logs` e gravando ações (`LOGIN`, `CREATE`, `UPDATE`, `DELETE` e ciclo de pedidos) em todos os módulos.
- **Frontend:** [`OrderHistoryDialog.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/orders/OrderHistoryDialog.tsx) com abas **Linha do Tempo** (chips `Antes → Depois`) e **Auditoria do Servidor** (`GET /audit-logs/entity/orders/:id`), além do painel [`AuditLogsPanel.tsx`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/components/pages/audit/AuditLogsPanel.tsx) em **Relatórios → Auditoria do Sistema** e **Configurações → Logs de Auditoria**.
- *(Importante ao atualizar o servidor HP `sv1`: rodar `npm run typeorm:migrate` no container/backend antes ou durante o deploy para aplicar as migrations `1790856601754`, `1790856601755` e `1790856601756`.)*

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

## 5. Rotina de Backup Automático Noturno no HD de 2TB

- **Dispositivo de Armazenamento:** HD secundário de 2TB (`/dev/sdd`, ext4, 1.8TB utilizáveis).
- **Ponto de Montagem Persistente:** `/mnt/backup_2tb` (configurado em `/etc/fstab` por UUID `abc067b1-4b1f-4794-ad81-78f4655153a9` com `nofail`).
- **Diretório de Backups:** `/mnt/backup_2tb/farmflow_backups/`
  - `/database/`: Dumps compactados do PostgreSQL (`farmflow_db_YYYY-MM-DD_HHMMSS.sql.gz`).
  - `/code/`: Tarballs compactados do código-fonte, configurações e `.env` de backend e frontend (`farmflow_apps_YYYY-MM-DD_HHMMSS.tar.gz`).
  - `/logs/`: Logs de auditoria mensais (`backup_YYYY-MM.log` e `cron.log`).
- **Script de Execução:** `/usr/local/bin/farmflow_backup.sh` (executável com verificação automática de montagem).
- **Agendamento no Cron:** `/etc/cron.d/farmflow_backup`
  ```cron
  0 3 * * * root /usr/local/bin/farmflow_backup.sh >> /mnt/backup_2tb/farmflow_backups/logs/cron.log 2>&1
  ```
  Executado toda madrugada às **03:00 AM**.
- **Política de Retenção:** Rotação automática que remove backups com mais de **30 dias** (`find -mtime +30 -exec rm`), mantendo o HD sempre saudável e prevenindo acúmulo desnecessário.

---

## 6. Próximos Passos Sugeridos

1. **Geração Direta de PDF nos Relatórios:**
   - Adicionar botão de exportação em PDF estruturado também nos Relatórios de Produtividade (`ReportsPage.tsx`).
2. **Pedidos Offline & Sincronização:**
   - Implementar fila offline em IndexedDB (`offlineOrderQueue`) com UUID idempotente e banner de sincronização automática ao retomar conexão para uso em campo sem sinal.
3. **Controle de Estoque Físico de Amostras:**
   - Rastreamento dos números de lacres e caixas de amostras de solo e foliar despachadas para o laboratório.
