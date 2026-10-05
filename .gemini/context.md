# Contexto do Projeto: FarmFlow (Ecosistema Frontend & Backend)

## Visão Geral
Aplicação de gestão agrícola ("FarmFlow") com cálculo avançado de orçamentos de serviços agronômicos, gestão de clientes, fazendas, talhões, ordens de serviço, produtos e variáveis de custo.

## Arquitetura e Stack
- **Frontend (`farm-flow-frontend`):** React 18, Vite, TypeScript, Tailwind CSS, Radix UI, Vitest, Lucide Icons. Roda na porta 8080.
- **Backend (`farm-flow-backend`):** Node.js 20, Express, TypeORM, PostgreSQL, JWT, Bcrypt, Vitest (`@vitest/coverage-v8`). Roda na porta 3333.
- **Integração:** Cliente REST em `src/services/api.ts` com prioridade backend-first e fallback automático para Supabase.

## Motores de Cálculo de Orçamento (`budget.xlsm`)
Todos os 9 serviços do Excel estão implementados e cobertos por testes unitários com 0,00% de divergência:
1. `ConferenciaService`: Amostragem de solo / conferência
2. `FoliarService`: Coleta foliar por ponto e alqueire
3. `CompactionService`: Compactação de solo
4. `DroneMappingService`: Mapeamento aéreo por drone
5. `ATVService`: Aplicação terrestre por quadriciclo
6. `SoilSamplingService`: Amostragem de solo / agricultura de precisão (grids)
7. `DroneSprayingService`: Pulverização com drone
8. `EqualizaService`: Equalização plurianual de contratos
9. `BiologicalProductsService`: Tabela de biológicos com curva de antecipação Lallemand

## Estado e Testes
- Backend: 22 suites, 89 testes passando, 91.71% de linhas cobertas (100% nos serviços essenciais). `npx tsc --noEmit` sem erros.
- Frontend: 13 suites, 29 testes passando, `npm run build` gerado com sucesso.