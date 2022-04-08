import React, { Component } from 'react';

import axios from "axios";
import Swal  from "sweetalert2";
import SwalOptions from "@commonComponents/functions/swalOptions";
import Routing     from '@publicFolder/bundles/fosjsrouting/js/router.min.js';

import Sort              from "@commonComponents/functions/sort";
import Filter            from "@commonComponents/functions/filter";
import TopToolbar        from "@commonComponents/functions/topToolbar";
import Formulaire        from "@dashboardComponents/functions/Formulaire";

import { Layout }        from "@dashboardComponents/Layout/Page";

import { ItemsList }       from "@userPages/components/Budget/Item/ItemsList";
import { ItemFormulaire }  from "@userPages/components/Budget/Item/ItemForm";

const URL_DELETE_ELEMENT    = 'api_budget_items_delete';
const MSG_DELETE_ELEMENT    = 'Supprimer cet élément ?';
let SORTER = Sort.compareCreatedAtInverse;

let sorters = [
    { value: 0, label: 'Création',  identifiant: 'sorter-created' },
    { value: 1, label: 'Nom',       identifiant: 'sorter-nom' },
]

let sortersFunction = [Sort.compareCreatedAtInverse, Sort.compareName];

let i = 0;

export class Items extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subContext: "create",
            perPage: 10,
            currentPage: 0,
            sorter: SORTER,
            pathDeleteElement: URL_DELETE_ELEMENT,
            msgDeleteElement: MSG_DELETE_ELEMENT,
            sessionName: "budget.items.pagination",
            classes: "",
            element: null,
            typeItem: props.type ? props.type : 0,
        }

        this.layout = React.createRef();

        this.handleGetData = this.handleGetData.bind(this);
        this.handleUpdateList = this.handleUpdateList.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleGetFilters = this.handleGetFilters.bind(this);
        this.handlePerPage = this.handlePerPage.bind(this);
        this.handleChangeCurrentPage = this.handleChangeCurrentPage.bind(this);
        this.handleSorter = this.handleSorter.bind(this);
        this.handleChangeContext = this.handleChangeContext.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.handleChangeSubContext = this.handleChangeSubContext.bind(this);

        this.handleContentList = this.handleContentList.bind(this);
        this.handleContentCreate = this.handleContentCreate.bind(this);
        this.handleContentUpdate = this.handleContentUpdate.bind(this);
    }

    handleGetData = (self) => { self.handleSetDataPagination(this.props.donnees, "read", "name", this.state.filters, Filter.filterType); }

    handleUpdateList = (element, newContext=null) => {
        const { dataPlanning } = this.props;
        const { perPage } = this.state;

        this.layout.current.handleUpdateList(element, newContext);

        let newDataPlanning = Formulaire.updateDataPagination(SORTER, newContext, newContext, dataPlanning, element, perPage);
        this.props.onUpdateData(newDataPlanning);
        this.setState({ subContext: "create", element: null })
    }

    handleGetFilters = (filters) => { this.layout.current.handleGetFilters(filters, Filter.filterType); }

    handleSearch = (search) => { this.layout.current.handleSearch(search, "budget-item", true, Filter.filterType); }

    handlePerPage = (perPage) => { TopToolbar.onPerPage(this, perPage, SORTER) }

    handleChangeCurrentPage = (currentPage) => { this.setState({ currentPage }); }

    handleSorter = (nb) => { SORTER = TopToolbar.onSorter(this, nb, sortersFunction, this.state.perPage) }

    handleChangeContext = (context, elem = null, typeItem) => {
        this.setState({ typeItem })
        this.layout.current.handleChangeContext(context, elem);
    }

    handleChangeSubContext = (subContext, element = null) => { this.setState({ subContext, element }) }

    handleDelete = (element, text='Cette action est irréversible.') => {
        const self = this;
        Swal.fire(SwalOptions.options(MSG_DELETE_ELEMENT, text))
            .then((result) => {
                if (result.isConfirmed) {
                    Formulaire.loader(true);
                    axios.delete(Routing.generate(URL_DELETE_ELEMENT, {'id': element.id}), {})
                        .then(function (response) {
                            self.handleUpdateList(element, "delete");
                        })
                        .catch(function (error) {
                            Formulaire.displayErrors(self, error, "Une erreur est survenue, veuillez contacter le support.")
                        })
                        .then(() => {
                            Formulaire.loader(false);
                        })
                    ;
                }
            })
        ;
    }

    handleContentList = (currentData, changeContext, getFilters, filters, data, dataImmuable) => {
        const { year, month, categories, total } = this.props;
        const { subContext, perPage, currentPage, typeItem, element } = this.state;

        return <ItemsList onChangeContext={changeContext}
                               onDelete={this.handleDelete}
                               //filter-search
                               onSearch={this.handleSearch}
                               filters={filters}
                               onGetFilters={this.handleGetFilters}
                               //changeNumberPerPage
                               perPage={perPage}
                               onPerPage={this.handlePerPage}
                               //twice pagination
                               currentPage={currentPage}
                               onPaginationClick={this.layout.current.handleGetPaginationClick(this)}
                               taille={data.length}
                               //sorter
                               sorters={sorters}
                               onSorter={this.handleSorter}
                               //data
                               subContext={subContext}
                               element={element}
                               onChangeSubContext={this.handleChangeSubContext}
                               typeItem={typeItem}
                               year={year} month={month} categories={categories} total={total}
                               onUpdateList={this.handleUpdateList}
                               dataImmuable={dataImmuable}
                               data={currentData} />
    }

    handleContentCreate = (changeContext) => {
        const { year, month, categories, total } = this.props;
        return <ItemFormulaire type="create" year={year} month={month} categories={categories} total={total} typeItem={this.state.typeItem}
                               onChangeContext={changeContext} onUpdateList={this.handleUpdateList} key={i++}/>
    }

    handleContentUpdate = (changeContext, element) => {
        const { year, month, categories, total } = this.props;
        return <ItemFormulaire type="update" year={year} month={month} categories={categories} total={total} typeItem={this.state.typeItem}
                               element={element} onChangeContext={changeContext} onUpdateList={this.handleUpdateList} key={i++}/>
    }

    render () {
        return <>
            <Layout ref={this.layout} {...this.state} onGetData={this.handleGetData}
                    onContentList={this.handleContentList}
                    onContentCreate={this.handleContentCreate} onContentUpdate={this.handleContentUpdate}
                    onChangeCurrentPage={this.handleChangeCurrentPage}/>
        </>
    }
}