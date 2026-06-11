# PET SUS Digital - Sistema de Apoio à Aplicação da AIDPI

## Sobre o Projeto

O **PET SUS Digital** é uma plataforma web desenvolvida no âmbito do **Programa de Educação pelo Trabalho para a Saúde (PET Saúde Digital)** da **Universidade Federal de Campina Grande (UFCG)**.

O projeto tem como objetivo apoiar a aplicação da **Estratégia de Atenção Integrada às Doenças Prevalentes na Infância (AIDPI)**, oferecendo uma ferramenta digital que auxilia profissionais e estudantes da área da saúde durante a avaliação clínica de crianças.

A plataforma busca tornar o processo de avaliação mais rápido, padronizado e acessível, contribuindo para a tomada de decisão clínica, para a educação em saúde e para a melhoria da qualidade do atendimento prestado à população infantil.

---

## Equipe

Somos uma equipe multidisciplinar vinculada ao PET Saúde Digital da UFCG, composta por:

* Estudantes de Enfermagem;
* Estudantes de Medicina;
* Estudantes de Design;
* Estudantes de Engenharia Elétrica;
* Estudantes de Ciência da Computação;
* Professoras da Universidade Federal de Campina Grande;
* Profissionais da área da Saúde.

A integração entre tecnologia, design e saúde possibilita a construção de soluções digitais voltadas para necessidades reais dos serviços de atenção à saúde.

---

## Objetivos

* Apoiar a aplicação da estratégia AIDPI;
* Facilitar a tomada de decisão clínica;
* Reduzir erros de interpretação dos protocolos;
* Disponibilizar materiais de apoio para consulta rápida;
* Armazenar histórico de atendimentos;
* Gerar relatórios e resumos das avaliações realizadas;
* Promover educação permanente em saúde.

---

## Funcionalidades

### Avaliação Clínica

* Checklist completo baseado na estratégia AIDPI;
* Classificação automática dos casos;
* Exibição de orientações e condutas sugeridas;
* Identificação de sinais de perigo.

### Geração de Relatórios

* Exportação da avaliação em formato PDF;
* Geração automática de resumo clínico;
* Compartilhamento facilitado dos resultados.

### Histórico de Atendimentos

* Armazenamento das avaliações realizadas;
* Consulta posterior dos registros;
* Associação dos atendimentos ao usuário autenticado;
* Exclusão de registros quando necessário.

### Área de Materiais

* Disponibilização de documentos de apoio;
* Visualização de protocolos;
* Consulta rápida a conteúdos educacionais.

### Autenticação de Usuários

* Cadastro com e-mail e senha;
* Login seguro;
* Controle de acesso às funcionalidades restritas;
* Proteção de páginas privadas.

---

## Tecnologias Utilizadas

### Front-End

* HTML5
* CSS3
* JavaScript (ES6+)

### Bibliotecas

* html2pdf.js
* jsPDF
* html2canvas

### Backend as a Service (BaaS)

* Firebase Authentication
* Cloud Firestore

### Hospedagem

* Netlify

### Controle de Versão

* Git
* GitHub

### Ferramentas de Desenvolvimento

* Visual Studio Code
* Linux Mint
* Google Chrome
* Firebase Console

---

## Estrutura do Projeto

```text
PET-SUS-Digital/
│
├── index.html
├── avaliacao.html
├── historico.html
├── material.html
├── quem-somos.html
│
├── css/
│   ├── style.css
│   └── material.css
│
├── js/
│   ├── avaliar.js
│   ├── gerarPDF.js
│   ├── salvarHistorico.js
│   ├── historico.js
│   ├── firebase.js
│   ├── login.js
│   ├── cadastro.js
│   └── protegerPagina.js
│
├── materiais/
│   └── aidpi.pdf
│
└── README.md
```

---

## Arquitetura

O sistema utiliza uma arquitetura baseada em serviços do Firebase:

### Authentication

Responsável pelo:

* Cadastro de usuários;
* Login;
* Logout;
* Controle de acesso.

### Firestore

Responsável pelo:

* Armazenamento das avaliações;
* Histórico de atendimentos;
* Associação entre usuários e registros.

### Netlify

Responsável pela:

* Hospedagem da aplicação;
* Disponibilização pública do sistema.

---

## Fluxo de Utilização

1. Usuário realiza login.
2. Acessa a área de avaliação.
3. Preenche o checklist AIDPI.
4. O sistema gera a classificação clínica.
5. O atendimento pode ser:

   * Salvo no histórico;
   * Exportado em PDF.
6. O histórico permanece disponível apenas para o usuário autenticado.

---

## Segurança

* Autenticação via Firebase Authentication;
* Controle de acesso por usuário;
* Histórico vinculado ao UID do usuário autenticado;
* Regras de acesso configuradas no Firestore.

---

## Possíveis Melhorias Futuras

* Dashboard com estatísticas;
* Busca avançada no histórico;
* Filtros por paciente;
* Impressão direta dos atendimentos;
* Exportação para Excel;
* Compartilhamento seguro entre profissionais;
* Integração com sistemas de prontuário eletrônico;
* Modo offline para utilização em locais sem internet;
* Responsividade avançada para dispositivos móveis.

---

## Instituição

Universidade Federal de Campina Grande (UFCG)

Programa de Educação pelo Trabalho para a Saúde Digital (PET Saúde Digital)

---

## Licença

Projeto desenvolvido para fins acadêmicos, educacionais e de extensão universitária.

Todos os direitos reservados aos autores e à Universidade Federal de Campina Grande.
