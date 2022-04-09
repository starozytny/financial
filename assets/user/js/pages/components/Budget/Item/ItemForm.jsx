import React, { Component } from 'react';

import axios                   from "axios";
import Routing                 from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import {Checkbox, Input, Radiobox, SelectReactSelectize} from "@dashboardComponents/Tools/Fields";
import { Alert }               from "@dashboardComponents/Tools/Alert";
import { Button }              from "@dashboardComponents/Tools/Button";
import { FormLayout }          from "@dashboardComponents/Layout/Elements";

import Validateur              from "@commonComponents/functions/validateur";
import Formulaire              from "@dashboardComponents/functions/Formulaire";
import Sanitaze                from "@commonComponents/functions/sanitaze";

const URL_CREATE_ELEMENT     = "api_budget_items_create";
const URL_UPDATE_GROUP       = "api_budget_items_update";
const TXT_CREATE_BUTTON_FORM = "Ajouter un nouveau élément";
const TXT_UPDATE_BUTTON_FORM = "Enregistrer les modifications";

export function ItemFormulaire ({ type, onChangeContext, onUpdateList, element, onChangeSubContext,
                                    year, month, typeItem = 0, categories, total = 0 })
{
    let title = "Ajouter un élément";
    let url = Routing.generate(URL_CREATE_ELEMENT);
    let msg = "Félicitations ! Vous avez ajouté un nouveau élément !"

    if(type === "update"){
        title = "Modifier " + element.name;
        url = Routing.generate(URL_UPDATE_GROUP, {'id': element.id});
        msg = "Félicitations ! La mise à jour s'est réalisée avec succès !";
    }

    let form = <Form
        context={type}
        url={url}
        year={element ? Formulaire.setValueEmptyIfNull(element.year, year) : year}
        month={element ? Formulaire.setValueEmptyIfNull(element.month, month) : month}
        name={element ? Formulaire.setValueEmptyIfNull(element.name) : ""}
        type={element ? Formulaire.setValueEmptyIfNull(element.type, typeItem) : typeItem}
        price={element ? Formulaire.setToFloat(element.price, "") : ""}
        cashback={element ? (element.haveCashback ? [1] : [0]) : [1]}
        category={element && element.category ? Formulaire.setValueEmptyIfNull(element.category.id, "") : ""}
        onUpdateList={onUpdateList}
        onChangeContext={onChangeContext}
        onChangeSubContext={onChangeSubContext}
        messageSuccess={msg}

        categories={categories}
        total={total}
    />

    return onChangeContext ? <FormLayout onChangeContext={onChangeContext} form={form}>{title}</FormLayout> : <>
        <div className="form">
            <h2>{title}</h2>
            {form}
        </div>
    </>
}

class Form extends Component {
    constructor(props) {
        super(props);

        this.state = {
            year: props.year,
            month: props.month,
            name: props.name,
            type: props.type,
            price: props.price,
            category: props.category,
            total: props.total,
            cashback: props.cashback,
            haveCashback: props.cashback[0] === 1,
            errors: [],
            success: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCleave = this.handleChangeCleave.bind(this);
        this.handleChangeSelect = this.handleChangeSelect.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange = (e) => {
        const { category } = this.state;

        let name = e.currentTarget.name;
        let value = e.currentTarget.value;

        if(name === "type"){
            if(category !== ""){
                this.setState({ category: "" })
            }

            if(parseInt(value) !== 0){
                this.setState({ cashback: [0], haveCashback: false })
            }else{
                this.setState({ cashback: [1], haveCashback: true })
            }
        }

        if(name === "cashback"){
            value = (e.currentTarget.checked) ? [1] : [0] // parseInt because work with int this time
            this.setState({ haveCashback: !!(e.currentTarget.checked) })
        }

        this.setState({[name]: value})
    }

    handleChangeCleave = (e) => { this.setState({[e.currentTarget.name]: e.currentTarget.rawValue}) }
    handleChangeSelect = (name, e) => { this.setState({ [name]: e !== undefined ? e.value : "" }) }

    handleSubmit = (e) => {
        e.preventDefault();

        const { context, url, messageSuccess } = this.props;
        const { name, type, price } = this.state;

        this.setState({ errors: [], success: false })

        let method = context === "create" ? "POST" : "PUT";

        let paramsToValidate = [
            {type: "text", id: 'name',  value: name},
            {type: "text", id: 'type',  value: type},
            {type: "text", id: 'price',  value: price},
        ];

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
                    if(self.props.onUpdateList){
                        self.props.onUpdateList(data, context, type);
                    }
                    if(self.props.onChangeContext){
                        self.props.onChangeContext("list");
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
        const { context, categories, onChangeSubContext } = this.props;
        const { errors, success, name, type, price, category, cashback } = this.state;

        let typeItems = [
            { value: 0,  label: 'Dépense',   identifiant: 'it-depense' },
            { value: 1,  label: 'Revenu',    identifiant: 'it-revenu' },
            { value: 2,  label: 'Economie',  identifiant: 'it-economie' },
        ]

        let categoryItems = [], categorySelected = null;
        if(categories){
            categories.forEach(el => {
                if(el.type === parseInt(type)){
                    categoryItems.push({ value: el.id, label: el.name, identifiant: "cat-f-" + el.id })
                }

                if(category && category === el.id){
                    categorySelected = el;
                }
            })
        }

        let switcherItems = [ { value: 1, label: 'Oui', identifiant: 'oui' } ]

        return <>
            <form onSubmit={this.handleSubmit}>

                {success !== false && <Alert type="info">{success}</Alert>}

                <div className="line">
                    <Input valeur={name} identifiant="name" errors={errors} onChange={this.handleChange}>Description</Input>
                </div>

                <div className="line">
                    <Input type="cleave" valeur={price} identifiant="price" errors={errors} onChange={this.handleChangeCleave}>Total</Input>
                </div>

                <div className="line">
                    <SelectReactSelectize items={categoryItems} identifiant="category" placeholder={"Sélectionner une catégorie"}
                                          valeur={category} errors={errors} onChange={(e) => this.handleChangeSelect('category', e)}>
                        Catégorie
                    </SelectReactSelectize>
                </div>

                {categorySelected && categorySelected.type === 2 && <>
                    <div className="line">
                        <div className="form-group">
                            <label>Objectif</label>
                            <div>{Sanitaze.toFormatCurrency(categorySelected.total)} / {Sanitaze.toFormatCurrency(categorySelected.goal)}</div>
                        </div>
                    </div>
                </>}

                <div className="line line-2 line-cashback">
                    <Radiobox items={typeItems} identifiant="type" valeur={type} errors={errors} onChange={this.handleChange}>Type</Radiobox>
                    {parseInt(type) === 0 ? <>
                        <Checkbox isSwitcher={true} items={switcherItems} identifiant="cashback" valeur={cashback} errors={errors} onChange={this.handleChange}>
                            Cashback 2% ?
                        </Checkbox>
                    </> : <div className="form-group" />}

                </div>

                <div className="line line-buttons">
                    <div className="form-button">
                        <Button isSubmit={true}>{context === "create" ? TXT_CREATE_BUTTON_FORM : TXT_UPDATE_BUTTON_FORM}</Button>
                        {context === "update" && <Button isSubmit={false} type="default" outline={true} onClick={() => onChangeSubContext("create")}>Annuler</Button>}
                    </div>
                </div>
            </form>
        </>
    }
}