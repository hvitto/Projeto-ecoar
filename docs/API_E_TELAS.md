## 1. O que é o sistema

- **ECOAR Beyond** é um sistema de criação e gerenciamento de personagens para o RPG ECOAR.
- **Funcionalidades principais:**
  - **Conta:** registro com email/senha, verificação de email, login, logout, e login com Google (se estiver configurado).
  - **Personagens:** criar personagem em um wizard (várias etapas), ver e editar ficha na “sheet”.
  - **Mesas:** criar mesa de jogo, convidar por link ou código, entrar em mesa, ver detalhes da mesa e associar personagem à mesa.

---

## 2. Onde testar (ambiente)

- **URL base:** em desenvolvimento costuma ser `http://localhost:3000`. Em staging/homologação, a URL será informada separadamente.
- **APIs:** todas ficam em `/api`. Exemplo: `http://localhost:3000/api/auth/login`.
- Se você for testar as APIs direto (Postman, curl, etc.), use essa base; nas telas, o próprio site já chama essas APIs.

### Conta de teste (login rápido)

Na tela de **Login** existe o botão **"Entrar com conta de teste"**. Basta clicar: o sistema cria o usuário de teste no banco (se ainda não existir) e faz o login automaticamente, levando você direto ao dashboard. Não é necessário rodar nenhum comando antes.

---

## 3. Telas e onde ficam na interface

### 3.1 Página inicial (`/`)

Tudo que não é “mesas” acontece na mesma URL `/` (a página troca de conteúdo conforme o estado):

| O que você vê | Quando aparece | O que dá para fazer |
|---------------|----------------|---------------------|
| Tela de boas-vindas | Primeira vez ou sem login | Escolher “Login” ou “Registrar”. |
| Formulário de **Login** | Clicou em Login ou não está logado | Informar email e senha; botão “Entrar com Google”; link para Registrar. |
| Formulário de **Registro** | Clicou em Registrar | Preencher email, senha, nome completo, nome de usuário; enviar. O sistema manda email de verificação. |
| **Dashboard** | Após login | Lista de personagens; botão “Novo personagem”; clicar em um personagem abre a ficha; acesso às mesas (criar/entrar). |
| **Wizard de criação** | Clicou em “Novo personagem” no dashboard | Primeiro: tela de **nível de alma** (escolher nível inicial e “Começar Criação”). Depois: várias etapas (raça, atributos, classe, etc.) até finalizar. Ao concluir, volta ao dashboard com o personagem na lista. |
| **Ficha do personagem (sheet)** | Clicou em um personagem no dashboard | Ver e editar todos os dados do personagem. |

Resumo do fluxo na home: **Login/Registro → Dashboard → Novo personagem → Wizard (nível de alma + etapas) → Dashboard → Clicar no personagem → Ficha.**

### 3.2 Mesas

| URL | O que é | Pré-condição |
|-----|---------|----------------|
| `/mesas/criar` | Página para **criar uma nova mesa** | Estar logado. |
| `/mesas/entrar` | Página para **entrar em uma mesa** (por link com token ou por código) | Estar logado. Pode abrir com link do tipo `/mesas/entrar?token=...`. |
| `/mesas/[id]` | **Detalhe da mesa** (dados da mesa, membros, personagens) | Estar logado e ser GM da mesa ou jogador que já entrou. |

No dashboard, o acesso às mesas (criar, entrar, listar) costuma ser por menu ou botões; ao criar ou entrar, o sistema pode redirecionar para a página da mesa (`/mesas/[id]`).

---

## 4. APIs (referência para testes de backend ou integração)

Quem for testar chamadas diretas às APIs pode usar a tabela abaixo. Todas as rotas são relativas à base (ex.: `http://localhost:3000/api`).

**Autenticação nas rotas protegidas:** enviar no header:  
`Authorization: Bearer <token>`  
O token é devolvido no login (email/senha) ou na volta do Google (na URL `?token=...`).

### 4.1 Autenticação

| Rota | Método | Precisa de token? | Observação |
|------|--------|-------------------|------------|
| `/api/auth/login` | POST | Não | Body: `{ email, password }`. Resposta 200 traz `user` e `token`. 403 se email não verificado. |
| `/api/auth/demo` | POST | Não | Cria o usuário de teste no banco (se não existir) e retorna `user` e `token`. Usado pelo botão "Entrar com conta de teste". |
| `/api/auth/register` | POST | Não | Body: `email`, `password`, `fullName`, `username`. Envia email de verificação. 409 se email ou username já existe. |
| `/api/auth/logout` | POST | Não | Só confirma; o cliente que remove o token. |
| `/api/auth/me` | GET | Sim | Retorna o usuário atual. |
| `/api/auth/verify-email` | GET | Não | Query: `?token=...`. Redireciona para home com `?verified=1` ou `?error=...`. |
| `/api/auth/resend-verification` | POST | Não | Body: `{ email }`. Reenvia email de verificação. |
| `/api/auth/google` | GET | Não | Redireciona para Google. |
| `/api/auth/google/callback` | GET | Não | Callback do Google; redireciona para home com `?token=...` ou `?error=...`. |

**Regras de registro (validação):** email válido; senha com no mínimo 6 caracteres; nome completo entre 2 e 100 caracteres; username entre 3 e 20 caracteres, só letras, números, `_` e `-`, e não pode começar ou terminar com `-` ou `_`.

### 4.2 Personagens

| Rota | Método | Precisa de token? | Observação |
|------|--------|-------------------|------------|
| `/api/characters` | GET | Sim | Lista os personagens do usuário. |
| `/api/characters` | POST | Sim | Cria personagem. Body: objeto com `name` ou `nome` e demais dados da ficha. |
| `/api/characters/[id]` | GET | Sim | Detalhe do personagem (se for do usuário ou da mesa com acesso). |
| `/api/characters/[id]` | PUT | Sim | Atualiza (dono do personagem ou GM da mesa). |
| `/api/characters/[id]` | DELETE | Sim | Remove (apenas dono). |

### 4.3 Mesas

| Rota | Método | Precisa de token? | Observação |
|------|--------|-------------------|------------|
| `/api/tables` | GET | Sim | Lista mesas em que o usuário é GM ou membro. |
| `/api/tables` | POST | Sim | Cria mesa. Body: `name` (obrigatório), opcional: `coverImageUrl`, `nextSessionAt`, `description`. Resposta traz `inviteToken` e `inviteCode` (para link e código de convite). |
| `/api/tables/join` | POST | Sim | Entrar em mesa. Body: `{ token }` (do link) ou `{ code }` (código da mesa). |
| `/api/tables/[id]` | GET | Sim | Detalhe da mesa (se GM ou membro). |
| `/api/tables/[id]/characters` | GET | Sim | Personagens vinculados à mesa. |
| `/api/tables/[id]/members/me/character` | PUT | Sim | Associa ou desassocia o personagem do usuário à mesa. Body: `{ characterId }` ou null. |

---

## 5. Exemplos de payload (para testes de API)

**Registro:**

```json
{
  "email": "teste@exemplo.com",
  "password": "senha123",
  "fullName": "Nome Completo",
  "username": "nome_usuario"
}
```

**Login:**

```json
{
  "email": "teste@exemplo.com",
  "password": "senha123"
}
```

**Criar mesa (com token no header):**

```json
{
  "name": "Mesa de teste",
  "description": "Sessão semanal"
}
```

**Entrar na mesa (com token no header):**  
Por link: `{ "token": "valor_do_invite_token" }`  
Por código: `{ "code": "ABC123" }`

**Criar personagem (com token no header):** no mínimo `name` ou `nome`; o restante da ficha pode ir no mesmo objeto.

---

## 6. O que vale a pena cobrir nos testes (escopo)

Abaixo estão as **áreas e pontos relevantes** para quem vai testar. Use como referência para montar seus casos; não é obrigatório “passar” por todos os itens – é o que existe no sistema e o que faz sentido exercitar.

### Autenticação

- Registro: campos válidos e inválidos (email, senha curta, username inválido, email/username já existente).
- Mensagem após registro (verificação de email); link de verificação (pode ir para spam).
- Login com email verificado; login com credenciais erradas; conta não verificada (mensagem esperada).
- Logout e novo acesso (deve pedir login de novo).
- Reenvio de email de verificação.
- Login com Google, se estiver habilitado no ambiente (pode não estar em dev).

### Personagens e wizard

- Dashboard: listar personagens, abrir ficha ao clicar em um personagem.
- Novo personagem: início do wizard (tela de nível de alma, botão “Começar Criação”), todas as etapas até finalizar.
- Após finalizar: personagem aparece no dashboard; ao abrir, a ficha exibe os dados preenchidos.
- Edição e exclusão de personagem (onde a interface permitir e pelas APIs, se for o caso).

### Mesas

- Criar mesa (nome obrigatório); conferir se aparece link/código de convite.
- Entrar em mesa por link (`/mesas/entrar?token=...`) e por código.
- Página da mesa: ver dados, membros, personagens; associar seu personagem à mesa quando a tela permitir.

### Navegação e erros

- Acesso à home sem estar logado (deve levar a login/registro).
- Acesso a `/mesas/criar`, `/mesas/entrar` e `/mesas/[id]` sem login ou sem permissão (comportamento esperado: redirecionar ou mensagem de não autorizado).
- Mensagens de erro da interface e das APIs (400, 401, 403, 404, 409) de forma que o usuário entenda o que aconteceu.

---

## 7. Observação

- **Google:** em desenvolvimento o login com Google pode não estar configurado; nesse caso o botão pode falhar. É esperado.
