# Minhas Finanças

Controle financeiro pessoal: contas fixas, contas variáveis do mês,
parcelamentos e projetos/metas (como uma viagem), com cálculo automático de
quanto guardar por mês pra alcançar cada meta — tudo isso em destaque logo na
Visão Geral: **Receita − Despesas = Sobra**.

## É só um site (sem servidor)

Feito só com HTML, CSS e JavaScript — sem backend, sem instalação. Isso é
proposital: assim ele roda direto no **GitHub Pages**, que hospeda arquivos
estáticos de graça.

Os dados ficam salvos no `localStorage` do navegador — guardados no seu
próprio aparelho, não em um servidor. Isso quer dizer:

- Fechar a aba, desligar o computador, voltar depois: os dados continuam lá.
- Abrir em outro navegador/aparelho não traz os dados — cada um tem o seu.
- Limpar os dados do navegador apaga os lançamentos.

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub.
2. Suba `index.html`, `style.css` e `app.js` para a raiz do repositório.
3. Vá em **Settings → Pages**.
4. Em "Build and deployment", escolha **Deploy from a branch**, branch
   `main`, pasta `/ (root)`. Salve.
5. Em alguns minutos o site fica disponível em
   `https://seu-usuario.github.io/nome-do-repositorio/`.

### Domínio próprio

Ainda em **Settings → Pages**, existe o campo **Custom domain**. Coloque seu
domínio lá, e crie o registro DNS (CNAME ou A, conforme o GitHub indicar) no
painel do seu provedor de domínio. Depois de propagar, o site abre direto
pelo seu domínio.

## Páginas do app

- **Visão geral**: bloco em destaque com Receita mensal − Despesas do mês =
  Sobra, atualizado automaticamente conforme você lança contas; extrato do
  mês e projetos em andamento.
- **Contas fixas**: as que se repetem todo mês (aluguel, assinaturas, etc).
- **Contas variáveis**: lançadas por mês (mercado, lazer, etc).
- **Parcelamentos**: valor total, número de parcelas, e um botão pra dar
  baixa mês a mês.
- **Projetos & metas**: valor objetivo, data limite — o app calcula quanto
  guardar por mês: `(objetivo − já guardado) / meses restantes`.
- **Sobre mim**: nome completo, salário mensal e banco de uso habitual.

## Rodando localmente antes de publicar

Basta abrir `index.html` no navegador. Se preferir simular via servidor:

```bash
python3 -m http.server 8080
```

E acessar `http://localhost:8080`.
