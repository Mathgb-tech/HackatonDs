# 🤰 Pré-Natal Ativo

> Ferramenta de priorização para agentes comunitários de saúde (ACS), enfermeiros e gestores da saúde pública brasileira, focada na busca ativa de gestantes em populações vulneráveis.

Desenvolvido durante o **Hackathon Pré-Natal Ativo · 01/10/2026**.

---

## 📋 Funcionalidades

- **Kanban de busca ativa** com 4 colunas de status (Em dia / Atenção / Busca ativa / Sem vínculo) e drag-and-drop para ajuste manual
- **Motor de regras automático** que recalcula o status de cada gestante com base em datas de consulta, faltas e exames pendentes
- **Mapa ACS** com pinos individuais coloridos por status (centrado em Salvador, BA) via Leaflet + OpenStreetMap
- **Mapa Gestor** com heatmap agregado por microárea — sem dados individuais (LGPD)
- **Dashboard de indicadores** com KPIs e gráfico histórico de tendências (Recharts)
- **Perfil da gestante** com histórico de consultas, linha do tempo de observações e ditado por voz
- **Registro de visita mobile-first** com simulação de modo offline
- **Controle de acesso por papel**: ACS (microárea própria) / Enfermeiro (todas as áreas) / Gestor (apenas dados agregados)
- **Busca por voz** no Kanban (requer Chrome ou Edge)
- **Persistência local** via `localStorage` com versionamento para evitar dados obsoletos

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| Drag & Drop | [@dnd-kit/core + @dnd-kit/sortable](https://dndkit.com/) |
| Mapas | [Leaflet](https://leafletjs.com/) + [react-leaflet](https://react-leaflet.js.org/) |
| Gráficos | [Recharts](https://recharts.org/) |
| Ícones | [Lucide React](https://lucide.dev/) |
| Componentes | [Radix UI](https://www.radix-ui.com/) (dialog, tooltip, dropdown) |
| Datas | [date-fns](https://date-fns.org/) |
| Linguagem | TypeScript |

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v18 ou superior → [nodejs.org](https://nodejs.org/)
- **npm** v9 ou superior (vem junto com o Node.js)

Verifique as versões com:

```bash
node -v
npm -v
```

---

## 🚀 Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Mathgb-tech/HackatonDs.git
cd HackatonDs
```

### 2. Instale as dependências

```bash
npm install
```

> ⚠️ Isso instalará todos os pacotes listados no `package.json`, incluindo Next.js, React, dnd-kit, Leaflet, Recharts e outros. Pode levar alguns minutos na primeira vez.

### 3. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### 4. Acesse no navegador

Abra **[http://localhost:3000](http://localhost:3000)**

---

## 🌐 Notas importantes

### Reconhecimento de voz
A busca por voz e o ditado de observações utilizam a **Web Speech API**, que **só funciona no Google Chrome ou Microsoft Edge**.

- ✅ Google Chrome
- ✅ Microsoft Edge
- ❌ Brave (bloqueia por padrão)
- ❌ Firefox (não suporta a API)

### Dados fictícios
O projeto usa dados 100% fictícios gerados no código (`src/lib/mockData.ts`). Não há backend nem banco de dados real. Todas as interações são salvas localmente no `localStorage` do navegador.

### Mapa
O mapa está centrado em **Salvador, Bahia** e usa tiles gratuitos do [OpenStreetMap](https://www.openstreetmap.org/). Requer conexão com a internet para carregar as imagens do mapa.

---

## 📁 Estrutura do projeto

```
src/
├── app/                        # Rotas (Next.js App Router)
│   ├── page.tsx                # Kanban (página inicial)
│   ├── dashboard/page.tsx      # Dashboard de indicadores
│   ├── mapa/page.tsx           # Mapa ACS (pinos individuais)
│   ├── mapa-gestor/page.tsx    # Mapa Gestor (heatmap agregado)
│   └── gestante/
│       └── [id]/
│           ├── page.tsx        # Perfil da gestante
│           └── visit/page.tsx  # Registro de visita
│
├── components/
│   ├── AppShell.tsx            # Layout principal + navegação por papéis
│   ├── KanbanBoard.tsx         # Board com DnD e busca
│   ├── KanbanColumn.tsx        # Coluna droppable
│   ├── KanbanCard.tsx          # Card draggable + droppable
│   └── map/
│       ├── MapACS.tsx          # Mapa com pinos individuais
│       └── MapGestor.tsx       # Mapa com círculos agregados
│
├── context/
│   └── GestanteContext.tsx     # Estado global + LGPD filtering + localStorage
│
└── lib/
    ├── types.ts                # Interfaces TypeScript
    ├── mockData.ts             # 17 gestantes fictícias com coords em Salvador
    ├── statusEngine.ts         # Motor de regras puro (sem IA)
    └── utils.ts                # Utilitários (cn)
```

---

## 👥 Papéis de usuário

Use o **seletor de papel** no topo da tela para alternar:

| Papel | Acesso |
|---|---|
| **ACS** | Kanban (microárea própria) + Mapa ACS |
| **Enfermeiro** | Kanban (todas as áreas) + Mapa ACS + Dashboard |
| **Gestor** | Mapa Gestor (agregado) + Dashboard |

> O Gestor **nunca** vê dados individuais — somente contagens por microárea. Isso é implementado no nível do contexto de dados (LGPD).

---

## 🏗️ Build para produção

```bash
npm run build
npm start
```

---

## 📄 Licença

Projeto desenvolvido para fins de demonstração no hackathon. Todos os dados são fictícios.
