# Contexto do Chat: FarmFlow (Frontend & Backend)

**Última Atualização:** 01 de Outubro de 2026

## Resumo das Ações Realizadas
1. **Análise de Cálculos da Planilha `budget.xlsm`:**
   - Diagnosticada e corrigida a divergência no `ConferenciaService` (remoção da sobretaxa de 5% de NF e correção da divisão por 100 de 20-40cm).
   - Replicados os 9 motores de cálculo: Conferência, Foliar, Compactação, Drone Mapeamento, ATV, Solo/AP, Pulverização Drone, Equalização Multi-anual e Produtos Biológicos.
2. **Desacoplamento do Supabase e Replicação 100% no Backend:**
   - Criado e estruturado o projeto `farm-flow-backend` (Node.js + Express + TypeORM + PostgreSQL).
   - Módulos completos replicados: Budget, User (Auth JWT + Bcrypt), Clients, Farms & Plots, Orders, Services & Groups, Products, Cost Variables, Sales, Person, Middleware de Autenticação (`ensureAuthenticated`).
   - Implementado cliente REST [`src/services/api.ts`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/src/services/api.ts) no frontend com estratégia backend-first e fallback automático para o Supabase.
3. **Suíte Completa de Testes Unitários:**
   - **Backend:** 22 suites, 89 testes passando, 0 falhas, 91.71% de cobertura de código (`vitest run --coverage`), 100% de cobertura nos serviços essenciais.
   - **Frontend:** 13 suites, 29 testes passando, 0 falhas, build de produção validado (`npm run build`).

## Como Iniciar Após Reiniciar a Máquina
- Sempre usar Node v20 via NVM: `$env:PATH = "C:\Users\User\AppData\Roaming\nvm\v20.20.2;" + $env:PATH;`
- Frontend: `npm run dev` (porta 8080)
- Backend: `npm --prefix "..\farm-flow-backend" run dev:server` (porta 3333)
- Testes: `npm test` no frontend e `npm test` no backend.
- Handoff completo detalhado: consultar [`HANDOFF.md`](file:///c:/Users/User/Documents/Projects/farm-flow-frontend/HANDOFF.md).