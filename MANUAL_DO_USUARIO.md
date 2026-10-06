# Manual do Usuário e Guia Operacional — Preciza

> **Preciza Agricultura de Precisão**  
> *Solução Integrada de Gestão de Clientes, Orçamentos Agronômicos, Operações de Campo e Controle Financeiro.*

---

## 🌾 1. Apresentação e Boas-Vindas

O **Preciza CRM & Gestão Agronômica** é uma plataforma desenvolvida sob medida para centralizar e profissionalizar todas as etapas do atendimento ao produtor rural: desde o primeiro contato comercial e cálculo automatizado de orçamentos técnicos até o acompanhamento do maquinário no campo, remessa de laudos laboratoriais e quitação financeira.

### Principais Benefícios:
- **Cálculo Técnico Automatizado:** Geração de propostas comerciais rigorosamente fiéis às tabelas e regras agronômicas oficiais.
- **Flexibilidade Total de Unidades (ha e alq):** O sistema calcula automaticamente entre Hectares e Alqueires Paulistas (`1 alqueire = 2,42 hectares`) em tempo real, sem arredondamentos errados.
- **Folha de Pedido Oficial em PDF:** Emissão instantânea de orçamentos timbrados em formato comercial para envio imediato pelo WhatsApp ou impressão física.
- **Rastreabilidade de Campo:** Controle de quem operou cada trator ou drone e qual área foi efetivamente concluída.
- **Controle Financeiro Transparente:** Baixa rápida de pagamentos totais ou parciais integrada ao fluxo de caixa.

---

## 🔐 2. Como Acessar o Sistema

O sistema é 100% web e pode ser acessado de qualquer computador, tablet ou celular conectado à internet, sem necessidade de instalar aplicativos pesados.

![Tela de Acesso e Login](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/01_tela_login.png)

### Passo a Passo de Acesso:
1. Abra o navegador de sua preferência (Google Chrome, Microsoft Edge, Safari).
2. Acesse o link fornecido pela equipe Preciza:
   - **Link de Acesso Online:** `https://statistical-institutes-wood-somehow.trycloudflare.com`
   - *(Ou na rede interna do escritório: `http://192.168.1.20:3000`)*
3. Digite o seu **E-mail** e **Senha** cadastrados.
4. Clique no botão verde **Entrar**.

---

## 📊 3. Painel Principal (Dashboard de Operações)

Assim que o login é efetuado, você tem acesso imediato à radiografia operacional da empresa em tempo real.

![Painel Principal e Indicadores Operacionais](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/02_dashboard_inicial.png)

### O que você visualiza nesta tela:
- **Clientes e Fazendas:** Total de produtores ativos e propriedades atendidas no sistema.
- **Pedidos Pendentes:** Orçamentos que aguardam aprovação comercial ou fechamento.
- **Execuções Agendadas:** Quantidade de serviços com equipe ou maquinário programados para os próximos dias.
- **Faturamento e Área Trabalhada:** Volume financeiro já recebido e total de hectares com amostragem ou pulverização realizada.
- **Atalhos Rápidos:** Botão **+ Novo Pedido** no canto superior para iniciar um orçamento em segundos.

---

## 👥 4. Gestão de Produtores e Clientes

No menu lateral esquerdo, clique em **Clientes** para acessar a carteira de produtores rurais.

![Lista de Clientes Cadastrados](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/03_gestao_clientes.png)

### Funcionalidades:
- **Busca Rápida:** Localize qualquer cliente pelo nome, CPF ou município.
- **Ações Rápidas:** Botões para editar dados cadastrais ou visualizar diretamente as fazendas do produtor.

### Cadastrando um Novo Produtor:
Ao clicar no botão verde **+ Novo Cliente**, abre-se o formulário de cadastro simplificado:

![Formulário de Cadastro do Produtor](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/04_modal_cliente.png)

> [!TIP]
> **Preenchimento Ágil:** Apenas o **Nome** do produtor é obrigatório para iniciar o atendimento. Informações como CPF, telefone, data de nascimento e inscrição estadual (CAD/PRO) podem ser preenchidas a qualquer momento.

---

## 🚜 5. Gestão de Fazendas e Talhões

No menu lateral, a aba **Fazendas** permite cadastrar as propriedades atendidas e seus respectivos talhões.

![Lista de Fazendas](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/05_gestao_fazendas.png)

### Cadastrando uma Nova Fazenda:
Ao clicar em **+ Nova Fazenda**, você verá o recurso exclusivo de **Conversão Inteligente de Medidas**:

![Cadastro de Fazenda com Conversão de Hectares e Alqueires](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/06_modal_fazenda.png)

> [!IMPORTANT]
> ### 🔄 Conversão Automática entre Alqueires e Hectares
> O produtor costuma falar em alqueires, mas o laudo técnico exige hectares? O sistema resolve isso na hora:
> - **Digite em Alqueires (ex: 20 alq):** O sistema calcula imediatamente `48.40 ha`.
> - **Digite em Hectares (ex: 48.40 ha):** O sistema converte para `20.00 alq`.
> O cálculo utiliza rigorosamente a taxa do Alqueire Paulista (`1 alq = 2,42 ha`) com fixação de duas casas decimais, eliminando erros manuais.

### Gerenciando Talhões:
Ao clicar no ícone de talhões de qualquer fazenda, o sistema abre o modal de divisão de áreas:

![Gerenciamento de Talhões da Propriedade](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/07_modal_talhoes.png)

- Você pode cadastrar talhões individuais (ex: *Talhão Sede*, *Pivô 1*, *Baixada*).
- O sistema exibe sempre a área de cada talhão em **Hectares e Alqueires** simultaneamente.

---

## 📝 6. Criação de Pedidos e Orçamentos Técnicos

A tela de **Pedidos** é o coração comercial do sistema. Nela ficam registradas todas as propostas, com status de aprovação, execução e pagamento.

![Painel de Pedidos e Orçamentos Comerciais](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/08_pedidos_tabela.png)

### Elaborando um Novo Orçamento:
Ao clicar em **+ Novo Pedido**, selecione o Cliente e a Fazenda. O sistema carrega instantaneamente a área da propriedade e ajusta as fórmulas conforme o serviço escolhido:

![Formulário de Orçamento de Agricultura de Precisão](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/09_modal_novo_pedido_ap.png)

### Opções Técnicas Disponíveis no Orçamento:
1. **Reanálise de Solo (Área já trabalhada?):** Aplica a tabela de desconto específica para clientes recorrentes.
2. **Emissão de Nota Fiscal:** Alternância rápida com recálculo dos impostos aplicáveis.
3. **Número de Pontos de Amostragem:** O sistema sugere automaticamente a densidade de pontos recomendada conforme o tamanho da área e exibe em tempo real a relação de `ha por ponto`.
4. **Determinações do Laudo / Book de Fertilidade:**
   - Adubação Corretiva (Inclusa)
   - Adubo de Base
   - Enxofre
   - Micronutrientes
   - Análise 20-40cm (Gesso)
   - Análise Física de Solo
5. **Condições Comerciais e Desconto:** Permite negociar valor fechado ou percentual de desconto com recálculo automático do valor por alqueire.

---

## 📄 7. Folha de Pedido Oficial (Impressão e PDF)

Na tabela de pedidos, ao clicar no botão com ícone de **Impressora**, o sistema gera imediatamente a **Folha de Pedido Oficial e Orçamento Comercial**:

![Folha de Pedido Oficial Timbrada](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/10_folha_pedido_orcamento.png)

### Recursos da Folha de Pedido:
- **Cabeçalho Timbrado Oficial:** Logomarca oficial da Preciza, CNPJ, endereço da matriz e telefones de contato.
- **Alternância de Vias:**
  - **Via Cliente:** Documento limpo e formal para apresentação e assinatura do produtor rural.
  - **Via Empresa:** Cópia com campos de controle interno da operação.
- **Itens e Discriminação Detalhada:** Lista todos os serviços contratados, quantidade de alqueires, número de pontos amostrais, itens inclusos no pacote e valor total.
- **📥 Baixar PDF:** Gera um arquivo `.pdf` oficial com um clique para envio direto no WhatsApp do produtor rural.
- **🖨️ Imprimir:** Envia diretamente para a impressora do escritório em folha A4.
- **✏️ Editar Valores e Campos:** Permite ajustar observações, lote ou dados adicionais antes da impressão.

---

## 📅 8. Agenda de Serviços e Execução de Campo

Após o pedido ser aprovado, ele entra na **Agenda de Serviços Agrícolas**.

![Agenda de Serviços e Execuções](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/11_agenda_execucao.png)

### O que você pode acompanhar:
- **Barra de Progresso (% Executado):** Mostra quantos hectares já foram realizados e quanto ainda resta fazer.
- **Filtros Operacionais:** Filtre por Operador, Equipamento (Trator/Drone/Quadriciclo), Município ou Status.
- **Alocação de Equipes:** Visualize quem é o responsável pela coleta ou pulverização.

### Registrando a Execução:
Ao clicar no botão de execução, o operador ou coordenador informa o trabalho realizado no dia:
- Pode registrar **Execução Total** (conclusão do serviço) ou **Execução Parcial** (ex: coletou 20 hectares hoje de um total de 48 ha).
- Aloca os operadores presentes e maquinários utilizados para controle de horímetro e produtividade.

---

## 💵 9. Controle Financeiro e Baixa de Pagamentos

No menu lateral, acesse **Financeiro** para gerenciar contas a receber e fluxo de caixa.

![Painel Financeiro e Contas a Receber](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/13_financeiro_fluxo_caixa.png)

### Indicadores Financeiros:
- **Faturamento Recebido:** Valores já pagos e conciliados.
- **A Receber / Em Aberto:** Saldo pendente de serviços contratados.
- **Volume Total Contratado:** Soma total de contratos ativos no sistema.

### Dando Baixa em um Pedido:
Ao clicar no botão verde **Dar Baixa**, abre-se o modal de quitação:

![Modal de Baixa Financeira](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/14_modal_baixa.png)

> [!TIP]
> ### 💡 Baixa Total ou Parcial Inteligente
> - **Liquidar Saldo Total:** Um clique no atalho verde preenche automaticamente o valor integral restante.
> - **Pagamento Parcelado / Entrada:** O cliente pagou apenas uma parte? Digite o valor recebido e o sistema calcula instantaneamente o saldo que restará para a próxima parcela.
> - **Forma de Pagamento:** Escolha entre PIX, Boleto, Cheque ou Dinheiro.
> - **Sincronização Automática:** Ao confirmar a baixa, o valor entra automaticamente no fluxo de caixa da empresa.

---

## 🧪 10. Gestão de Análises Laboratoriais

Na aba **Análises**, a equipe técnica acompanha as amostras de solo e folhas enviadas aos laboratórios parceiros:

![Controle de Análises Laboratoriais](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/15_analises_laboratoriais.png)

- Controle de remessas e lotes por fazenda.
- Registro dos tipos de análise solicitados (`Macro`, `Macro+S`, `Física`, `Foliar`).
- Acompanhamento do status de recebimento de laudos técnicos para elaboração dos mapas de recomendação.

---

## ⚙️ 11. Configurações Operacionais da Empresa

A aba **Configurações** permite personalizar tabelas de preço, maquinários e colaboradores:

![Catálogo de Serviços e Configurações Operacionais](C:/Users/User/.gemini/antigravity-ide/brain/e7c64fb6-148e-45e9-9039-f967d8db42d2/screens/16_configuracoes_operacionais.png)

### Abas de Configuração:
1. **Serviços:** Catálogo de serviços agronômicos da empresa com preço base por alqueire (Amostragem de Solo, Pulverização com Drone, Aplicação com ATV, etc.).
2. **Equipamentos:** Cadastro da frota (caminhonetes, quadriciclos, tratores e drones) com controle de placa, horímetro e número de série.
3. **Colaboradores:** Equipe técnica de campo e consultores autorizados.
4. **Variáveis de Custo:** Parâmetros de combustível, diárias e insumos operacionais.
5. **Cabeçalho de PDFs:** Personalização dos dados da empresa, telefone e logotipo exibidos nas folhas de pedido oficiais.

---

## 📞 12. Suporte e Contato

Em caso de dúvidas operacionais ou solicitação de novos acessos:
- **E-mail:** `contato@preciza.com.br`
- **Telefone:** `(45) 3242-2210`
- **Endereço:** Rua Hortência, 112, Sala 02 — Corbélia - Paraná
