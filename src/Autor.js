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
      <div className="content" id="content">
        <AutorForm />
        <AutorTable lista={this.state.lista} />
      </div>
    )
  }
}

class AutorForm extends Component {
  constructor() {
    super();
    this.state = { nome: '', email: '', senha: '' };
    this.enviaForm = this.enviaForm.bind(this);
    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);
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

  setNome(event) {
    this.setState({ nome: event.target.value });
  }

  setEmail(event) {
    this.setState({ email: event.target.value });
  }

  setSenha(event) {
    this.setState({ senha: event.target.value });
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
          <CustomInput id="nome" type="text" name="nome" value={this.state.nome} onChange={this.setNome} />
          <CustomInput id="email" type="email" name="email" value={this.state.email} onChange={this.setEmail} />
          <CustomInput id="senha" type="password" name="senha" value={this.state.senha} onChange={this.setSenha} />
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