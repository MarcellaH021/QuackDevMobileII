# 🦆 QuackDev (RecrutaDEV - Edição Rubber Duck)

> *"Tá dengoso por conta do código? Quer um consolo? Quack quack! Vem de pato de borracha!"* 🐥💻

---

## 💡 Ideia da Aplicação
O **QuackDev** é um aplicativo mobile gamificado de triagem e gestão de talentos tech inspirado na prática clássica de *Rubber Duck Debugging*. 

Em vez de processos seletivos frios e burocráticos, o recrutador avalia os desenvolvedores deslizando cards em uma interface dinâmica e responsiva com mecânica de swipes, animações na UI Thread, modelo de negócios *Freemium* (Pato Amarelo Free vs. Pato Dourado PRO) e integração com a câmera nativa do dispositivo para o cadastro dos candidatos.

---

## 🎯 Objetivos do Projeto

- **Triagem Gamificada:** Implementar navegação fluida em duas telas principais (Deck de Seleção e Painel do Gerente).
- **Manipulação de Gestos Nativos:** Controlar ações essenciais do app via gestos com a UI Thread (`Swipe/Pan`, `Tap/Double Tap` e `Pinch/Zoom`).
- **Camada Freemium:** Aplicar travas operacionais e monetização simulada entre usuários gratuitos e assinantes do plano PRO (bloqueio de dados sensíveis, limites de cota e ação de Revert).
- **Acesso ao Hardware (Nativo):** Construir um CRUD completo de candidatos com captura de foto via Câmera e Galeria.

---

## 🎨 Identidade Visual & Paleta de Cores

A identidade visual foi pensada para balancear a estética descontraída do pato de borracha com a legibilidade de uma aplicação tech moderna em *Dark Mode*:

| Amostra | Cor | Nome / Uso Sugerido |
| :---: | :--- | :--- |
| 🟡 | `#FFD23F` | **Duck Yellow (Principal):** Botões de ação, destaque de cards e títulos |
| 🟠 | `#FF8C42` | **Beak Orange (Secundária):** Ícones, badges de destaque e alertas |
| 🪙 | `#F4B41A` | **Golden Duck (Plano PRO):** Borda de cards premium, travas e badges PRO |
| 🔵 | `#1A2238` | **Deep Pond (Fundo Principal):** Background das telas (modo escuro suave) |
| 🔷 | `#28334E` | **Card Surface (Fundo dos Cards):** Base dos cards de candidatos e modais |
| ⚪ | `#F8F9FA` | **Foam White (Tipografia Base):** Textos principais e títulos |
| 🟢 | `#4EBA6F` | **Hire Green (Sucesso):** Swipe de aprovação |
| 🔴 | `#E63946` | **Reject Red (Descarte):** Swipe de descarte |

---

## 👥 Integrantes da Equipe

| Nome Completo | GitHub |
| :--- | :--- |
| Marcella Hernandes de Souza | [GitHub Marcella](https://github.com/MarcellaH021) |
| Rafael Cacho de Barros | [GitHub Rafael](https://github.com/LordeSeuZe) |

---

## 🔗 Links e Recursos (Em Construção 🚧)

- **Protótipo no Figma:** `https://www.figma.com/design/gskBOD62MB2aTbkYGoTmRV/QuackDev?node-id=0-1&t=ppU0HXiPibQIFOiN-1`
- **Demonstração em Vídeo:** `https://drive.google.com/file/d/1Vaw-nToEneJbXxqF8cDzNHOt_vHaNSg0/view?usp=drive_link`

---

## Tecnologias
- Expo e React Native
- React Navigation
- React Native Gesture Handler
- React Native Reanimated
- Expo Image Picker
- AsyncStorage
- Expo Blur

## Como executar
1. Instale Node.js LTS e o aplicativo Expo Go no celular.
2. Descompacte o projeto e abra a pasta no terminal.
3. Execute `npm install`.
4. Execute `npx expo start`.
5. Leia o QR code com o Expo Go. Para testar a câmera, use um dispositivo físico.

## Funcionalidades implementadas
### Deck de Seleção
- Arrastar para a direita aprova o candidato.
- Arrastar para a esquerda descarta o candidato.
- Arrastar para cima abre os detalhes.
- Toque simples abre a gaveta com bio e tecnologias.
- Dois toques marcam o candidato como prioridade.
- Pinça na foto permite ampliar durante o gesto.
- Botões também estão disponíveis para aprovar, descartar e priorizar.

### Painel do Gerente
- Lista construída com `FlatList`.
- Candidatos prioritários aparecem primeiro.
- Exibe situação de cada candidato.
- Permite editar, excluir e alterar a prioridade.
- Atalho para cadastrar novos candidatos.

### Cadastro e recurso nativo
- CRUD de candidatos: criar, consultar, atualizar e excluir.
- Campos: nome completo, idade, foto e tecnologias; também bio, pretensão salarial e análise.
- Foto pela câmera ou pela galeria, com pedido de permissão.
- Dados ficam salvos no dispositivo com AsyncStorage.

### Freemium
- Plano Free: swipes sem limite e até três aprovações por sessão.
- Ao atingir o limite, aparece a modal do PRO.
- Plano PRO de demonstração: libera aprovações sem limite, desfazer o último swipe e visualização da pretensão salarial/análise.
- A ação de desfazer swipe aparece no Painel do Gerente.
- A ativação do PRO é local e demonstrativa; não existe pagamento.

## Gestos e animações
Os gestos são implementados com React Native Gesture Handler. A posição do card e o zoom são controlados por Reanimated, que executa as atualizações animadas na UI thread. O gesto de arrastar usa limiares horizontais para decidir entre aprovação e descarte.

---

## 🛠️ Status do Projeto
> 🚧 **Projeto em fase final para avaliação de estruturação e prototipagem.** 
