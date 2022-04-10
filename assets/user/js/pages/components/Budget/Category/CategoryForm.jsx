import React, { Component } from 'react';

import axios                   from "axios";
import Routing                 from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import { Input, Radiobox }     from "@dashboardComponents/Tools/Fields";
import { Alert }               from "@dashboardComponents/Tools/Alert";
import { Button }              from "@dashboardComponents/Tools/Button";
import { FormLayout }          from "@dashboardComponents/Layout/Elements";

import Validateur              from "@commonComponents/functions/validateur";
import Helper                  from "@commonComponents/functions/helper";
import Formulaire              from "@dashboardComponents/functions/Formulaire";

const URL_CREATE_ELEMENT     = "api_budget_categories_create";
const URL_UPDATE_GROUP       = "api_budget_categories_update";
const TXT_CREATE_BUTTON_FORM = "Enregistrer";
const TXT_UPDATE_BUTTON_FORM = "Enregistrer les modifications";

export function CategoryFormulaire ({ type, onChangeContext, onUpdateList, element, isSaving = false })
{
    let title = "Ajouter une " + (isSaving ? "économie" : "catégorie");
    let url = Routing.generate(URL_CREATE_ELEMENT);
    let msg = "Félicitations ! Vous avez ajouté une nouvelle " + (isSaving ? "économie" : "catégorie") + " !"

    if(type === "update"){
        title = "Modifier " + element.name;
        url = Routing.generate(URL_UPDATE_GROUP, {'id': element.id});
        msg = "Félicitations ! La mise à jour s'est réalisée avec succès !";
    }

    let form = <Form
        context={type}
        url={url}
        name={element ? Formulaire.setValueEmptyIfNull(element.name) : ""}
        type={element ? Formulaire.setValueEmptyIfNull(element.type, isSaving ? 2 : 0) : isSaving ? 2 : 0}
        goal={element ? Formulaire.setValueEmptyIfNull(element.goal, "") : ""}
        onUpdateList={onUpdateList}
        onChangeContext={onChangeContext}
        messageSuccess={msg}
        isSaving={isSaving}
    />

    return <FormLayout onChangeContext={onChangeContext} form={form}>{title}</FormLayout>
}

class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: props.name,
            type: props.type,
            goal: props.goal,
            errors: [],
            success: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCleave = this.handleChangeCleave.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        Helper.toTop();
    }

    handleChange = (e) => {
        let name = e.currentTarget.name;
        let value = e.currentTarget.value;

        if(name === "type" && value !== "" && parseInt(value) === 2){
            this.setState({ goal: "" })
        }

        this.setState({[name]: value })
    }
    handleChangeCleave = (e) => { this.setState({[e.currentTarget.name]: e.currentTarget.rawValue}) }

    handleSubmit = (e) => {
        e.preventDefault();

        const { context, url, messageSuccess, isSaving } = this.props;
        const { name, type, goal } = this.state;

        this.setState({ errors: [], success: false })

        let method = context === "create" ? "POST" : "PUT";

        let paramsToValidate = [
            {type: "text", id: 'name',  value: name},
            {type: "text", id: 'type',  value: type}
        ];

        if(parseInt(type) === 2){
            paramsToValidate = [...paramsToValidate,
                ...[{type: "text", id: 'goal', value: goal}]
            ];
        }

        // validate global
        let validate = Validateur.validateur(paramsToValidate)
        if(!validate.code){
            Formulaire.showErrors(this, validate);
        }else{
            Formulaire.loader(true);
            let self = this;

            axios({ method: method, url: url, data: this.state })
                .then(function (response) {
                    let data = response.data;
                    Helper.toTop();
                    if(self.props.onUpdateList){
                        self.props.onUpdateList(data);
                    }
                    self.setState({ success: messageSuccess, errors: [] });
                    if(context === "create"){
                        self.setState( {
                            name: '',
                            type: isSaving ? 2 : 0,
                            goal: '',
                        })
                    }
                })
                .catch(function (error) {
                    Formulaire.displayErrors(self, error);
                })
                .then(() => {
                    Formulaire.loader(false);
                })
            ;
        }
    }

    render () {
        const { context, isSaving } = this.props;
        const { errors, success, name, type, goal } = this.state;

        let typeItems = [
            { value: 0,  label: 'Dépense',   identifiant: 'cat-depense' },
            { value: 1,  label: 'Revenu',    identifiant: 'cat-revenu' },
            { value: 2,  label: 'Economie',  identifiant: 'cat-economie' },
        ]

        return <>
            <form onSubmit={this.handleSubmit}>

                {success !== false && <Alert type="info">{success}</Alert>}

                <div className="line line-2">
                    <Input valeur={name} identifiant="name" errors={errors} onChange={this.handleChange}>Intitulé</Input>
                    {isSaving ? <div className="form-group"/> : <>
                        <Radiobox items={typeItems} identifiant="type" valeur={type} errors={errors} onChange={this.handleChange}>Type</Radiobox>
                    </>}
                </div>

                {parseInt(type) === 2 && <div className="line line-2">
                    <Input type="cleave" valeur={goal} identifiant="goal" errors={errors} onChange={this.handleChangeCleave}>Objectif</Input>
                    <div className="form-group" />
                </div>}

                <div className="line">
                    <div className="form-button">
                        <Button isSubmit={true}>{context === "create" ? TXT_CREATE_BUTTON_FORM : TXT_UPDATE_BUTTON_FORM}</Button>
                    </div>
                </div>
            </form>
        </>
    }
}