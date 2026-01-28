# Regras de Desenvolvimento e Padrões de Código

## 1. Convenções de Nomenclatura (Language Standards)
- **Idioma:** Todo o código (variáveis, funções, classes, parâmetros, comentários técnicos) deve ser escrito em **Inglês**.
  - ❌ `function calcularTotal(valor)`
  - ✅ `function calculateTotal(amount)`
- **Variáveis e Funções:** Use `camelCase`. Ex: `getUserData`, `isLoading`.
- **Componentes React:** Use `PascalCase`. Ex: `UserProfile`, `SubmitButton`.
- **Constantes:** Use `UPPER_SNAKE_CASE` para constantes globais. Ex: `MAX_RETRY_COUNT`.

## 2. Clean Code & Best Practices
- **Nomes Descritivos:** Evite abreviações obscuras. `user` é melhor que `u`.
- **Funções Pequenas:** Mantenha funções e componentes focados em uma única responsabilidade (SRP).
- **Early Return:** Use retornos antecipados (guard clauses) para evitar aninhamento excessivo de `if/else`.
- **DRY (Don't Repeat Yourself):** Evite duplicação de lógica. Extraia para hooks ou utilitários.

## 3. TypeScript & React
- **Tipagem:** Evite `any` a todo custo. Use interfaces ou types explícitos.
- **Hooks:** Separe lógica de estado complexa em custom hooks (como visto em `useCounterAnimation`).
- **Imutabilidade:** Nunca mute o estado diretamente.

## 4. Comentários
- Comentários no código devem explicar o "porquê" e não o "como". Devem ser em Portugues.

## 5. Automated Testing
- **Padrão AAA:** Estruture os testes em Arrange (preparar), Act (executar) e Assert (verificar).
- **Descrições:** Use frases descritivas em Inglês no `it` ou `test`.
  - ❌ `it('test 1')`
  - ✅ `it('should display the user profile when data is loaded')`
- **Behavior over Implementation:** Teste o comportamento observável pelo usuário, não detalhes de implementação interna.
- **Mocks:** Mocke chamadas externas (API), mas evite mockar a lógica de negócio que está sendo testada.