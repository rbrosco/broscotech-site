## Configurando o Chatwoot

Para que o Chatwoot funcione corretamente, você precisa configurar a URL base da sua instância do Chatwoot.

1.  Crie um arquivo chamado `.env.local` na raiz do seu projeto.
2.  Adicione a seguinte linha a este arquivo:

    ```
    NEXT_PUBLIC_CHATWOOT_BASE_URL=https://app.chatwoot.com
    ```

3.  Se você estiver usando uma instância auto-hospedada (self-hosted) do Chatwoot, substitua `https://app.chatwoot.com` pela URL da sua instância.

4.  Após criar o arquivo `.env.local`, você precisará reiniciar o servidor de desenvolvimento para que as alterações tenham efeito.
