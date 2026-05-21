# Skill: Cálculo de Frete e Cache de Geolocalização

## 🕵️ Rastreabilidade (Obrigatório)
- Toda resposta gerada usando esta skill DEVE iniciar com a seguinte tag de identificação na primeira linha: 
  `[🤖 Agente TechFood | Skill Ativada: <Nome_Da_Skill_Aqui>]`
- O `<Nome_Da_Skill_Aqui>` DEVE ser exatamente igual ao título desta skill, sem acentos e com palavras separadas por hífen (ex: `05-frete-geolocalizacao`).

## 🎯 Objetivo
Orientar o agente na manutenção do `FreteService` e `CepService`, garantindo o cálculo de distância via fórmula de Haversine e a estratégia de cache de CEPs.

## 📌 Localização no Projeto
- Serviços de Domínio: `src/domain/services/FreteService.ts`
- Serviços de Infraestrutura: `src/infrastructure/services/CepService.ts`
- Repositório de Cache: `src/infrastructure/repositories/GeolocalizacaoRepository.ts`

## 📝 Procedimento Passos (Workflow)
1. **Fluxo de Consulta:** Ao receber um CEP, verificar primeiro se ele existe no banco de dados (`Geolocalizacao`).
2. **Estratégia de Cache Miss:** Se o CEP não existir no banco, disparar a integração com a API CEP Aberto, persistir as coordenadas (latitude e longitude) retornadas na tabela `Geolocalizacao` e seguir para o cálculo.
3. **Cálculo de Distância:** Aplicar estritamente a fórmula matemática de Haversine para calcular a distância em quilômetros entre as coordenadas do fornecedor e as do cliente.
4. **Aplicação de Matriz de Taxas:**
   - **Até 10 km (Local):** R$ 5,00 fixo | Prazo: 1 dia
   - **10 a 50 km (Regional):** R$ 0,50 por km | Prazo: 2 dias
   - **50 a 200 km (Estual):** R$ 0,45 por km | Prazo: 3 dias
   - **Acima de 200 km (Nacional):** R$ 0,40 por km | Prazo: 5 dias

## 🛑 Restrições e Guardrails
- NUNCA consulte a API CEP Aberto se o CEP já estiver registrado na tabela `Geolocalizacao`.
- As taxas e prazos de frete devem ser centralizados e nunca calculados com números mágicos soltos no código.
