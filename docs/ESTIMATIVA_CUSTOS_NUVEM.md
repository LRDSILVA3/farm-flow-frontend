# Estimativa Completa de Custos em Nuvem — FarmFlow (Preciza Tecnologia)

Este documento detalha os custos mensais estimados para operar o sistema **FarmFlow 100% em nuvem**, acessível de qualquer lugar com domínio próprio, certificado de segurança (HTTPS) e rotina automatizada de backups.

> **Nota:** Os valores abaixo representam estimativas de mercado dos provedores de infraestrutura em nuvem (pagos diretamente às plataformas contratadas em nome da Preciza).

---

## 1. Componentes da Infraestrutura em Nuvem

Para rodar a stack completa do FarmFlow (`farmflow-frontend` + `farmflow-backend` + `farmflow-postgres` + backups), a estrutura é composta por:

1. **Domínio Próprio** (ex: `preciza.com.br` ou subdomínio `sistema.preciza.com.br`): Endereço oficial de acesso.
2. **DNS, SSL/HTTPS & Segurança de Borda**: Certificado digital e proteção contra ataques (Cloudflare Free).
3. **Hospedagem / Servidor (Compute)**: Máquina em nuvem para rodar os containers Docker (Frontend Nginx, API Node.js e PostgreSQL).
4. **Armazenamento & Backups Off-site**: Cópia diária automática do banco de dados fora do servidor principal e espaço para anexos/PDFs/mapas.

---

## 2. Cenários de Contratação em Nuvem (Custo Mensal)

### Opção 1 — Nuvem Inicial (VPS de Entrada no Brasil)
*Indicado para início rápido com equipe enxuta, mantendo baixa latência no Brasil e custo mensal reduzido.*

| Item | Provedor / Especificação Sugerida | Custo Original | Custo Mensal (BRL) |
| :--- | :--- | :--- | :--- |
| **Domínio `.com.br`** | Registro.br | R$ 40,00 / ano | **R$ 3,35** |
| **DNS, SSL (HTTPS) & Firewall** | Cloudflare Free | Grátis | **R$ 0,00** |
| **Hospedagem VPS (BR)** | VPS KVM 1 (1–2 vCPU, 4 GB RAM, 50 GB NVMe) | ~R$ 30,00 a R$ 50,00 / mês | **R$ 30,00 a R$ 50,00** |
| **Banco de Dados** | PostgreSQL em container dedicado na VPS | Incluso na VPS | **R$ 0,00** |
| **Armazenamento & Backup Externo** | Cloudflare R2 (Free tier até 10 GB) | Grátis até 10 GB | **R$ 0,00** |
| **TOTAL MENSAL ESTIMADO** | | | **~R$ 33,35 a R$ 53,35 / mês** |

---

### Opção 2 — Nuvem Recomendada (VPS Brasil + Snapshot) ⭐ *Melhor Custo-Benefício*
*Arquitetura equilibrada com folga de memória RAM e disco NVMe rápido, ideal para uso simultâneo da equipe comercial, campo e financeiro.*

| Item | Provedor / Especificação Sugerida | Custo Original | Custo Mensal (BRL) |
| :--- | :--- | :--- | :--- |
| **Domínio `.com.br`** | Registro.br (`.com.br`) | R$ 40,00 / ano | **R$ 3,35** |
| **DNS, SSL (HTTPS) & CDN** | Cloudflare Free | Grátis | **R$ 0,00** |
| **Hospedagem VPS (BR)** | Hostinger KVM 2 ou equivalente (2 vCPU, 8 GB RAM, 100 GB NVMe, IP dedicado) | ~R$ 42,99/mês (promo plano longo) a ~R$ 77,99/mês (renovação) | **R$ 43,00 a R$ 78,00** |
| **Banco de Dados** | PostgreSQL em container dedicado na VPS | Incluso na VPS | **R$ 0,00** |
| **Backup Off-site & Storage Extra** | Cloudflare R2 / Snapshot Automático da VPS | ~R$ 10,00 a R$ 15,00 / mês | **R$ 10,00 a R$ 15,00** |
| **E-mail Transacional (Opcional)** | Resend / Brevo (até 3.000 e-mails/mês grátis) | Grátis no plano inicial | **R$ 0,00** |
| **TOTAL MENSAL ESTIMADO** | | | **~R$ 56,35 a R$ 96,35 / mês** |

---

### Opção 3 — Nuvem Corporativa Gerenciada (Alta Disponibilidade / Banco Isolado)
*Indicada para maior escala, separando servidor de aplicação, banco de dados gerenciado (backups Point-in-Time) e storage dedicado para arquivos pesados.*

| Item | Provedor / Especificação Sugerida | Custo Original (Ref. USD) | Custo Mensal Estimado (BRL)* |
| :--- | :--- | :--- | :--- |
| **Domínio `.com.br`** | Registro.br | R$ 40,00 / ano | **R$ 3,35** |
| **DNS, SSL & WAF** | Cloudflare Free / Pro | US$ 0,00 | **R$ 0,00** |
| **Servidor App (Frontend + API)** | DigitalOcean Droplet (2 vCPU, 4 GB RAM, 80 GB SSD) ou AWS EC2 | ~US$ 24,00 / mês | **~R$ 140,00** |
| **Banco PostgreSQL Gerenciado** | DigitalOcean Managed PostgreSQL (1–2 GB RAM, 10–25 GB SSD + Backups) | US$ 15,00 a US$ 30,00 / mês | **R$ 90,00 a R$ 175,00** |
| **Armazenamento S3 / Object Storage** | DigitalOcean Spaces / AWS S3 (250 GB p/ backups, PDFs, anexos e mapas) | ~US$ 5,00 / mês | **~R$ 30,00** |
| **TOTAL MENSAL ESTIMADO** | | | **~R$ 265,00 a R$ 350,00 / mês** |

*\*Valores em BRL estimados com dólar de referência (~R$ 5,80) + encargos internacionais, variando conforme o câmbio vigente.*

---

## 3. Crescimento de Armazenamento (Storage)

No funcionamento padrão (cadastros, ordens, cálculos, agenda, financeiro e geração de PDF sob demanda), o sistema consome **menos de 2 GB** no primeiro ano.

Caso a empresa decida armazenar grande volume de arquivos pesados diretamente na plataforma (laudos digitalizados, shapefiles KML/SHP, imagens de campo ou ortomosaicos):

* **Cloudflare R2:** 10 GB gratuitos todos os meses; armazenamento adicional por **~US$ 0,015/GB (~R$ 0,09 por GB/mês)** sem taxa de tráfego de saída (download).
  * *Exemplo:* 100 GB armazenados = **~R$ 8,00 a R$ 10,00 / mês**.
* **AWS S3 / DigitalOcean Spaces:** A partir de **US$ 5,00/mês (~R$ 30/mês)** com 250 GB inclusos.

---

## 4. Resumo Comparativo para Tomada de Decisão

| Critério | Nuvem Inicial (VPS Entrada) | Nuvem Recomendada (VPS BR) | Nuvem Gerenciada (HA) |
| :--- | :---: | :---: | :---: |
| **Investimento Mensal** | **~R$ 35 – 55** | **~R$ 60 – 95** | **~R$ 265 – 350** |
| **Memória / Capacidade** | 4 GB RAM / 50 GB NVMe | **8 GB RAM / 100 GB NVMe** | App 4 GB + DB Isolado |
| **Domínio próprio + HTTPS** | Incluso | **Incluso** | Incluso |
| **Backup Externo Off-site** | R2 até 10 GB (Grátis) | **Snapshot + R2** | Point-in-Time Gerenciado |
| **Upgrade para plano maior** | Imediato | **Imediato** | Sob demanda |
