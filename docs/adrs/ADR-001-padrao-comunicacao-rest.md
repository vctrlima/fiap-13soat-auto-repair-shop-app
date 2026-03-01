# ADR-003: Padrão de Comunicação Síncrono via REST

## Status

Aceito

## Contexto

O sistema Auto Repair Shop precisa definir o padrão de comunicação entre os clientes (frontend/mobile) e a API, bem como entre os componentes internos. A escolha do padrão de comunicação impacta a complexidade, performance, debugging e manutenibilidade.

Padrões avaliados:

- **REST** (Representational State Transfer) sobre HTTP
- **gRPC** com Protocol Buffers
- **GraphQL**
- **Mensageria assíncrona** (SQS/SNS, RabbitMQ)

## Decisão

Adotamos **REST sobre HTTP** como padrão de comunicação principal, com endpoints documentados via **OpenAPI 3.0 (Swagger)**.

## Justificativa

1. **Simplicidade e universalidade**: REST é o padrão mais adotado para APIs web, com ampla compatibilidade com clientes e ferramentas.
2. **Documentação automática**: Integração nativa com Swagger/OpenAPI para geração de documentação interativa.
3. **Compatível com API Gateway**: AWS API Gateway HTTP v2 suporta nativamente rotas REST com integração Lambda e ALB.
4. **Cacheabilidade**: Respostas HTTP podem ser cacheadas com headers padrão (ETag, Cache-Control).
5. **Debugging facilitado**: Ferramentas como Postman, curl e browsers facilitam teste e debugging.
6. **Curva de aprendizado**: Desenvolvedores já possuem familiaridade com REST.

## Consequências

- **Positivas**: Documentação automática, ecossistema maduro, fácil integração com ferramentas de monitoramento e teste.
- **Negativas**: Over-fetching em queries complexas; sem suporte nativo a streaming bidirecional. Mitigado pelo design adequado dos endpoints e uso de filtros/paginação.

## Alternativas Consideradas

| Padrão     | Prós                                        | Contras                                                  |
| ---------- | ------------------------------------------- | -------------------------------------------------------- |
| gRPC       | Performance superior, tipagem forte         | Complexidade, incompatível com browsers nativamente      |
| GraphQL    | Flexibilidade de queries, sem over-fetching | Complexidade de cache, N+1 queries, curva de aprendizado |
| Mensageria | Desacoplamento, resiliência                 | Complexidade operacional, eventual consistency           |
