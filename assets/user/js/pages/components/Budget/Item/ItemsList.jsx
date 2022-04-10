import React, { Component } from 'react';

import axios   from "axios";
import Routing from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import { Filter, FilterSelected }   from "@dashboardComponents/Layout/Filter";
import { TopSorterPagination }      from "@dashboardComponents/Layout/Pagination";
import { Button, ButtonIcon }       from "@dashboardComponents/Tools/Button";
import { Search }                   from "@dashboardComponents/Layout/Search";
import { Input }                    from "@dashboardComponents/Tools/Fields";
import { Alert }                    from "@dashboardComponents/Tools/Alert";
import { Aside }                    from "@dashboardComponents/Tools/Aside";

import Validateur   from "@commonComponents/functions/validateur";
import Formulaire   from "@dashboardComponents/functions/Formulaire";
import Sanitaze     from "@commonComponents/functions/sanitaze";

import { ItemsItem }      from "@userPages/components/Budget/Item/ItemsItem";
import { ItemFormulaire } from "@userPages/components/Budget/Item/ItemForm";
import { ChartDay }       from "@userPages/components/Stats/Charts";

let i = 0;

export class ItemsList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            useSaving: "",
            asideElement: null,
            errors: []
        }

        this.filter = React.createRef();
        this.aside = React.createRef();

        this.handleFilter = this.handleFilter.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleOpenAside = this.handleOpenAside.bind(this);
        this.handleUseSaving = this.handleUseSaving.bind(this);
    }

    handleFilter = (e) => {
        this.filter.current.handleChange(e, true);
    }

    handleOpenAside = (asideElement) => {
        this.setState({ asideElement: asideElement, useSaving: asideElement.total })
        this.aside.current.handleOpen()
    }

    handleChange = (e) => { this.setState({[e.currentTarget.name]: e.currentTarget.value}) }

    handleUseSaving = (e) => {
        const { year, month } = this.props;
        const { asideElement, useSaving } = this.state;

        e.preventDefault();

        this.setState({ errors: [] })

        let paramsToValidate = [
            {type: "text", id: 'useSaving',  value: useSaving}
        ];

        // validate global
        let validate = Validateur.validateur(paramsToValidate)

        if(useSaving !== "" && parseFloat(useSaving) > asideElement.total){
            validate.code = false;
            validate.errors.push({
                name: "useSaving",
                message: "La valeur ne peut pas être supérieure à " + Sanitaze.toFormatCurrency(asideElement.total) + "."
            })
        }

        if(!validate.code){
            Formulaire.showErrors(this, validate);
        }else{
            Formulaire.loader(true);
            let self = this;
            axios({ method: "POST", url: Routing.generate('api_budget_categories_use_saving', {'id': asideElement.id, 'year': year, 'month': month}), data: this.state })
                .then(function (response) {
                    let data = response.data;

                    let item = JSON.parse(data.item);
                    let category = JSON.parse(data.category);

                    self.props.onUpdateDuplicate(item)
                    self.props.onUpdateCategories(category)

                    self.aside.current.handleClose();
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
        const { subContext, taille, data, dataImmuable, perPage, onGetFilters, filters, onSearch, onPerPage,
            onPaginationClick, currentPage, sorters, onSorter,
            onUpdateList, typeItem, year, month, categories, total, element, onChangeSubContext } = this.props;
        const { asideElement, errors, useSaving } = this.state;

        let filtersLabel = ["Dépenses", "Revenus", "Economies"];
        let filtersId    = ["f-expenses", "f-revenus", "f-economies"];

        let itemsFilter = [
            { value: 0, id: filtersId[0], label: filtersLabel[0]},
            { value: 1, id: filtersId[1], label: filtersLabel[1]},
            { value: 2, id: filtersId[2], label: filtersLabel[2]}
        ];

        let savings = [];
        if(categories){
            categories.forEach(cat => {
                if(cat.type === 2){
                    savings.push(cat);
                }
            })
        }

        let contentAside = asideElement ? <form>
            <div className="line">
                <Input type="number" step="any" min={0} max={asideElement.total} valeur={useSaving} identifiant="useSaving"
                       errors={errors} onChange={this.handleChange}>
                    Utilisation ({Sanitaze.toFormatCurrency(asideElement.total)} max.)
                </Input>
            </div>

            <div className="line line-buttons">
                <div className="form-button">
                    <Button onClick={this.handleUseSaving}>Valider</Button>
                </div>
            </div>
        </form> : <div />

        return <>
            <div className="page-col-2">
                <div className="col-2">
                    <div>
                        <ItemFormulaire type={subContext} element={element} onChangeSubContext={onChangeSubContext}
                                        year={year} month={month} categories={categories} total={total} typeItem={typeItem}
                                        onUpdateList={onUpdateList} key={i++} />
                    </div>

                    {savings.length !== 0 && <>
                        <div className="use-saving">
                            <h2>Utilisation des économies</h2>
                            <div>
                                <Saving data={savings} onOpen={this.handleOpenAside}/>
                            </div>
                        </div>
                    </>}

                    {(dataImmuable && dataImmuable.length !== 0) && <>
                        <div className="charts">
                            <h2>Statistiques</h2>
                            <ChartDay data={dataImmuable} key={i++} />
                        </div>
                    </>}

                </div>
                <div className="col-1">
                    <div className="toolbar">
                        <div className="item filter-search">
                            <Filter ref={this.filter} items={itemsFilter} filters={filters} onGetFilters={onGetFilters} />
                            <Search onSearch={onSearch} placeholder="Recherche par description.."/>
                            <FilterSelected filters={filters} items={itemsFilter} onChange={this.handleFilter}/>
                        </div>
                    </div>

                    <TopSorterPagination sorters={sorters} onSorter={onSorter}
                                         currentPage={currentPage} perPage={perPage} onPerPage={onPerPage} taille={taille} onClick={onPaginationClick}/>

                    <div className="items-table">
                        <div className="items items-default items-budget">
                            <div className="item item-header">
                                <div className="item-content">
                                    <div className="item-body">
                                        <div className="infos infos-col-4">
                                            <div className="col-1">Date</div>
                                            <div className="col-2">Description</div>
                                            <div className="col-3">Total</div>
                                            <div className="col-4 actions">Actions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {data && data.length !== 0 ? data.map(elem => {
                                return <ItemsItem {...this.props} elem={elem} key={elem.id}/>
                            }) : <Alert>Aucun résultat</Alert>}
                        </div>
                    </div>
                </div>
            </div>

            <Aside ref={this.aside} content={contentAside}>Utilisation</Aside>
        </>
    }
}

function Saving ({ data, onOpen }) {
    return <div className="items-table">
        <div className="items items-default">
            <div className="item item-header">
                <div className="item-content">
                    <div className="item-body">
                        <div className="infos infos-col-3">
                            <div className="col-1">Catégorie</div>
                            <div className="col-2">Objectif</div>
                            <div className="col-3 actions">Actions</div>
                        </div>
                    </div>
                </div>
            </div>
            {data.map(elem => {
                return <div className="item" key={elem.id}>
                    <div className="item-body">
                        <div className="infos infos-col-3">
                            <div className="col-1">{elem.name}</div>
                            <div className="col-2">{Sanitaze.toFormatCurrency(elem.total)} / {Sanitaze.toFormatCurrency(elem.goal)}</div>
                            <div className="col-3 actions">
                                {elem.total > 0 && <ButtonIcon icon="cart" onClick={() => onOpen(elem)}>Utiliser</ButtonIcon>}
                            </div>
                        </div>
                    </div>
                </div>
            })}
        </div>
    </div>
}