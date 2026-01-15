# Guia de Boas Práticas de Desenvolvimento - StoryFlow

Este guia serve como referência para encerrar suas sessões de trabalho e retornar no dia seguinte com segurança, minimizando erros como a "tela branca".

## 🌙 Encerrando o Dia (Checklist de Saída)

1.  **Pare o Servidor Local**:
    *   Vá até o terminal onde o `npm run dev` está rodando.
    *   Pressione `Ctrl + C` e confirme com `S` (ou `Y`) se solicitado, para interromper o processo limpamene.
    *   *Por que?* Isso libera a porta (ex: 5173) e garante que processos "fantasmas" não fiquem rodando em segundo plano consumindo memória.

2.  **Salver seu Progresso (Git)**:
    *   Isso é **crítico**. Nunca deixe código não salvo ou não "commitado" de um dia para o outro se ele estiver funcionando.
    *   Comandos sugeridos:
        ```bash
        git add .
        git commit -m "feat: resumo do que foi feito hoje"
        # Opcional: git push origin main
        ```
    *   *Por que?* Se amanhã o código quebrar, você tem um ponto seguro para voltar. A "tela branca" muitas vezes ocorre porque tentamos continuar de um código que já estava "meio quebrado" no dia anterior.

3.  **Feche as Abas do Navegador**:
    *   Feche a aba do `localhost:5173`.
    *   *Por que?* Navegadores modernos tentam restaurar sessões e cache agressivamente. Reabrir uma aba "velha" pode carregar um estado de memória antigo. É melhor abrir uma nova aba limpa no dia seguinte.

---

## ☀️ Iniciando o Dia (Checklist de Retorno)

1.  **Verifique o Terminal**:
    *   Abra o terminal na pasta do projeto.
    *   Rode `npm run dev`.
    *   **OLHE o terminal antes de abrir o navegador.**
    *   Se aparecer `Done in Xms` ou `Vite v5.x.x ready`, está tudo certo.
    *   Se aparecerem linhas vermelhas ou erros de TypeScript, resolva-os **antes** de tentar abrir o site. Tela branca geralmente é causada por erros que JÁ apareceram no terminal.

2.  **Abra o Navegador**:
    *   Clique no link exibido no terminal (geralmente `http://localhost:5173`) ou digite em uma nova aba.

3.  **Se der Tela Branca**:
    *   Não entre em pânico.
    *   Abra o **Console do Desenvolvedor** (F12 no navegador). A aba "Console" vai te dizer exatamente qual linha vermelha causou o erro (ex: "Undefined is not an object").
    *   Volte ao terminal e veja se há erros lá também.

## 🚀 Resumo

A "tela branca" que você viu hoje não foi porque o PC foi desligado, mas sim porque havia **erros de código** (sintaxe e tipos) que impediam o React de "montar" a tela.

O segredo é: **Se o código compila sem erros (no terminal), a tela não ficará branca.**

Mantenha o terminal sempre visível!
