# Estimativa Completa de Custos em Nuvem — FarmFlow (Preciza Tecnologia)

Este documento detalha os custos mensais estimados caso a Preciza opte por operar o sistema **FarmFlow 100% em nuvem** (acessível externamente com domínio próprio e HTTPS), em comparação à estrutura local atual no servidor HP.

---

## 1. Visão Geral dos Componentes Necessários

Para rodar o ecossistema completo do FarmFlow na nuvem (`farmflow-frontend` + `farmflow-backend` + `farmflow-postgres` + backups), são necessários 4 pilares:

1. **Domínio Próprio (`sistema.preciza.com.br` ou `farmflow.com.br`)**: Endereço oficial na internet.
2. **DNS, SSL/HTTPS & Segurança de Borda**: Certificado digital gratuito e proteção contra ataques (Cloudflare).
3. **Hospedagem / Servidor de Aplicação & Banco de Dados**: Infraestrutura para executar os containers Docker (Frontend Nginx, API Node.js e PostgreSQL).
4. **Armazenamento & Backups Off-site**: Cópia diária automática do banco de dados e espaço para arquivos/PDFs/anexos fora do servidor principal.

---

## 2. Comparativo de Cenários (Custo Mensal Estimado)

### Opção A — Servidor Local Atual (HP) + Acesso Externo Opcional
*Infraestrutura já configurada e operando sem mensalidade de servidor.*

| Item | Serviço / Especificação | Custo Mensal |
| :--- | :--- | :--- |
| **Servidor / Hospedagem** | Servidor HP próprio da Preciza (Docker + Coolify) | R$ 0,00 |
| **Banco de Dados** | PostgreSQL local | R$ 0,00 |
| **Backups** | Rotina noturna automática no HD secundário (2 TB) | R$ 0,00 |
| **Domínio (Opcional)** | Registro.br (`.com.br` — R$ 40,00/ano) + Cloudflare Tunnel | ~R$ 3,35 *(ou R$ 0 se só interno)* |
| **TOTAL MENSAL** | | **R$ 0,00 a R$ 3,35 / mês** |

> **Ponto de atenção:** Depende da energia elétrica e internet do escritório onde o servidor HP está instalado.

---

### Opção B — Nuvem Enxuta / Melhor Custo-Benefício (VPS no Brasil) ⭐ *Recomendado para Início em Nuvem*
*Sistema 100% em nuvem com datacenter no Brasil (baixa latência), rodando toda a stack via Docker.*

| Item | Provedor / Especificação Sugerida | Custo Original | Custo Mensal (BRL) |
| :--- | :--- | :--- | :--- |
| **Domínio `.com.br`** | Registro.br (`.com.br`) | R$ 40,00 / ano | **R$ 3,35** |
| **DNS, SSL (HTTPS) & CDN** | Cloudflare Free (SSL automático + Firewall) | Grátis | **R$ 0,00** |
| **Hospedagem VPS (BR)** | Hostinger VPS KVM 2 (2 vCPU, 8 GB RAM, 100 GB NVMe, IP dedicado) | ~R$ 42,99/mês (promo 24m) / ~R$ 77,99/mês (renovação) | **R$ 43,00 a R$ 78,00** |
| **Banco de Dados** | PostgreSQL em container dedicado na mesma VPS | Incluso na VPS | **R$ 0,00** |
| **Armazenamento & Backup Off-site** | Cloudflare R2 (10 GB grátis; acima disso ~R$ 0,09/GB) ou Snapshot da VPS | Free tier até 10 GB / +Backup automático | **R$ 0,00 a R$ 15,00** |
| **E-mail Transacional (Opcional)** | Resend / Brevo (até 3.000 e-mails/mês grátis) | Grátis no plano inicial | **R$ 0,00** |
| **TOTAL MENSAL ESTIMADO** | | | **R$ 46,35 a R$ 96,35 / mês** |

* **Média realista considerando renovação padrão + snapshot semanal de segurança:** **~R$ 85,00 a R$ 95,00 / mês**.
* **Capacidade:** Suporta confortavelmente dezenas de usuários simultâneos, milhares de pedidos, geração de PDFs e rotinas de backup diário.

---

### Opção C — Nuvem Corporativa Gerenciada (Alta Disponibilidade / Banco Isolado)
*Arquitetura separada com banco de dados gerenciado pelo provedor (failover, backups point-in-time e escalabilidade independente), indicada quando houver alto volume ou exigência de SLA corporativo.*

| Item | Provedor / Especificação Sugerida | Custo Original (Ref. USD) | Custo Mensal Estimado (BRL)* |
| :--- | :--- | :--- | :--- |
| **Domínio `.com.br`** | Registro.br | R$ 40,00 / ano | **R$ 3,35** |
| **DNS, SSL & WAF** | Cloudflare Free / Pro | US$ 0,00 | **R$ 0,00** |
| **Servidor App (Frontend + API)** | DigitalOcean Droplet (2 vCPU, 4 GB RAM, 80 GB SSD) ou AWS EC2/ECS | ~US$ 24,00 / mês | **~R$ 140,00** |
| **Banco PostgreSQL Gerenciado** | DigitalOcean Managed PostgreSQL (1–2 GB RAM, 10–25 GB SSD + Backups) | US$ 15,00 a US$ 30,00 / mês | **R$ 90,00 a R$ 175,00** |
| **Armazenamento S3 / Object Storage** | DigitalOcean Spaces / AWS S3 (250 GB p/ backups, PDFs, anexos e mapas) | ~US$ 5,00 / mês | **~R$ 30,00** |
| **TOTAL MENSAL ESTIMADO** | | | **~R$ 265,00 a R$ 350,00 / mês** |

*\*Valores em BRL convertidos com dólar de referência aproximado (~R$ 5,80) + IOF/taxas de cartão internacional, podendo variar conforme o câmbio.*

---

## 3. Detalhamento sobre Armazenamento (Storage)

Hoje o FarmFlow armazena dados relacionais no PostgreSQL e gera as Folhas de Pedido em PDF sob demanda no navegador/servidor, consumindo **menos de 2 GB** no primeiro ano de uso intenso.

Caso a Preciza queira expandir o sistema futuramente para armazenar **arquivos pesados em nuvem** (ex.: anexos de laudos laboratoriais, shapefiles KML/SHP, mapas de aplicação ou fotos de campo):

* **Cloudflare R2:** 10 GB gratuitos todos os meses; após isso, cerca de **US$ 0,015/GB (~R$ 0,09 por GB/mês)** sem cobrança de tráfego de saída (download).
  * *Exemplo:* 100 GB de arquivos guardados = **~R$ 8,00 a R$ 10,00 / mês**.
* **AWS S3 / Backblaze B2 / DigitalOcean Spaces:** A partir de **US$ 5,00/mês (~R$ 30/mês)** com 250 GB inclusos.

---

## 4. Resumo Executivo para Decisão

| Critério | Servidor Local (Atual) | Nuvem Enxuta (VPS BR) | Nuvem Gerenciada |
| :--- | :---: | :---: | :---: |
| **Investimento Mensal** | **R$ 0 – R$ 3,35** | **~R$ 50 – R$ 95** | **~R$ 265 – R$ 350** |
| **Disponibilidade 24/7 externa** | Depende de internet/luz local | **99,9% (Datacenter)** | **99,95%+ (SLA Cloud)** |
| **Domínio próprio + HTTPS** | Opcional (via Túnel) | **Incluso** | **Incluso** |
| **Backup fora do escritório** | Manual / local no HD 2TB | **Automático em nuvem (R2)** | **Automático Point-in-Time** |
| **Facilidade de migração** | — | **Imediata (mesmo Docker)** | Rápida (Docker + DB externo) |

> **Conclusão:** Como toda a arquitetura do FarmFlow já foi construída em **Docker** (`farmflow-frontend`, `farmflow-backend` e `farmflow-postgres`), a Preciza pode iniciar utilizando o servidor HP atual sem custo de nuvem e **migrar para a Nuvem Enxuta (~R$ 50–95/mês) a qualquer momento em menos de 1 dia**, sem necessidade de reescrever código.
