import React, { Component } from 'react';
import CustomInput from './components/CustomInput';
import PubSub from 'pubsub-js';
import ErrorHandler from './ErrorHandler';

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = { lista: [], autores: [] };
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/livros')
            .then(res => res.json())
            .then(data => this.setState({ lista: data }));
        fetch('http://localhost:8080/api/autores')
            .then(res => res.json())
            .then(data => this.setState({ autores: data }));

        PubSub.subscribe('atualiza-lista-livros', (topico, listalivros) =>
            this.setState({ lista: listalivros }))
    }

    render() {
        return (
            <div id="main">
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <LivroForm autores={this.state.autores} />
                    <LivroTable lista={this.state.lista} />
                </div>
            </div>
        )
    }
}

class LivroForm extends Component {
    constructor() {
        super();
        this.state = { titulo: '', preco: '', autorId: '' };
        this.enviaForm = this.enviaForm.bind(this);
        this.setTitulo = this.setTitulo.bind(this);
        this.setPreco = this.setPreco.bind(this);
        this.setAutorId = this.setAutorId.bind(this);
    }

    enviaForm(event) {
        event.preventDefault();

        fetch('http://localhost:8080/api/livros', {
            headers: { 'Content-type': 'application/json' },
            method: 'post',
            body: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId })
        })
            .then(res => {
                PubSub.publish('limpa-erros', {});
                if (!res.ok) throw res.json();
                return res.json();
            })
            .then(data => {
                PubSub.publish('atualiza-lista-livros', data);
                this.setState({ titulo: '', preco: '', autorId: '' });
            })
            .catch(err => err.then(json => new ErrorHandler().displayError(json)))

    }

    setTitulo(event) {
        this.setState({ titulo: event.target.value });
    }

    setPreco(event) {
        this.setState({ preco: event.target.value });
    }

    setAutorId(event) {
        this.setState({ autorId: event.target.value });
    }

    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm} method="post">
                    <CustomInput id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo} />
                    <CustomInput id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco} />
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label>
                        <select value={this.state.autorId} name="autorId" id="autorID" onChange={this.setAutorId}>
                            <option value="">Selecione autor</option>
                            {
                                this.props.autores.map(autor => <option key={autor.id} value={autor.id}>{autor.nome}</option>)
                            }
                        </select>
                    </div>
                    <div className="pure-control-group">
                        <label></label>
                        <button type="submit" className="pure-button pure-button-primary">Gravar</button>
                    </div>
                </form>

            </div>)
    }
}

class LivroTable extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preço</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map((livro) => {
                                return (
                                    <tr key={livro.id}>
                                        <td>{livro.titulo}</td>
                                        <td>{livro.preco}</td>
                                        <td>{livro.autor.nome}</td>
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