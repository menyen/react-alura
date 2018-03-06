import React, { Component } from 'react';
import CustomInput from './components/CustomInput';
import PubSub from 'pubsub-js';
import ErrorHandler from './ErrorHandler';

export default class AutorBox extends Component {
  constructor() {
    super();
    this.state = { lista: [] };
  }

  componentDidMount() {
    fetch('http://localhost:8080/api/autores')
      .then(res => res.json())
      .then(data => this.setState({ lista: data }));

    PubSub.subscribe('atualiza-lista-autores', (topico, listaAutores) =>
      this.setState({ lista: listaAutores }))
  }

  render() {
    return (
      <div id="main">
        <div className="header">
          <h1>Cadastro de Autores</h1>
        </div>
        <div className="content" id="content">
          <AutorForm />
          <AutorTable lista={this.state.lista} />
        </div>
      </div>
    )
  }
}

class AutorForm extends Component {
  constructor() {
    super();
    this.state = { nome: '', email: '', senha: '' };
    this.enviaForm = this.enviaForm.bind(this);
  }

  enviaForm(event) {
    event.preventDefault();

    fetch('http://localhost:8080/api/autores', {
      headers: { 'Content-type': 'application/json' },
      method: 'post',
      body: JSON.stringify({ nome: this.state.nome, email: this.state.email, senha: this.state.senha })
    })
      .then(res => {
        PubSub.publish('limpa-erros', {});
        if (!res.ok) throw res.json();
        return res.json();
      })
      .then(data => {
        PubSub.publish('atualiza-lista-autores', data);
        this.setState({ nome: '', email: '', senha: '' });
      })
      .catch(err => err.then(json => new ErrorHandler().displayError(json)))

  }

  setInputModification(inputName, event) {
    this.setState({ [inputName]: event.target.value });
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <CustomInput id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setInputModification.bind(this, 'nome')} />
          <CustomInput id="email" type="email" name="email" value={this.state.email} onChange={this.setInputModification.bind(this, 'email')} />
          <CustomInput id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setInputModification.bind(this, 'senha')} />
          <div className="pure-control-group">
            <label></label>
            <button type="submit" className="pure-button pure-button-primary">Gravar</button>
          </div>
        </form>

      </div>)
  }
}

class AutorTable extends Component {
  render() {
    return (
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>email</th>
            </tr>
          </thead>
          <tbody>
            {
              this.props.lista.map((autor) => {
                return (
                  <tr key={autor.id}>
                    <td>{autor.nome}</td>
                    <td>{autor.email}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )
  }
}