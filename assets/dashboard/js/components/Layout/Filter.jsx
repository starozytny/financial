import React, { Component } from 'react';

function FilterComponent({ type="simple", typeFilter, items, title, icon, width, classes, filters, onChange }) {
    let style = null;
    if(width){
        style = { width: width + "px" }
    }

    return <div className={"filter" + (classes ? " " + classes : "")} style={style}>
        <div className="dropdown">
            <div className={`dropdown-btn ${filters.length !== 0 ? "active" : ""}`}>
                <span>{title ? title : "Filtre"}</span>
                <span className={"icon-" + (icon ? icon : "filter")} />
            </div>
            <div className="dropdown-items">
                {items.map((el, index) => {
                    let checked = false;
                    filters.forEach(filter => {
                        if(el.value === filter){
                            checked = true;
                        }
                    })

                    return <div className="item" key={index}>
                        <input type="checkbox" name={type === "simple" ? "filters" : typeFilter}
                               id={el.id} value={el.value} defaultChecked={checked} onChange={onChange}/>
                        <label htmlFor={el.id}>{el.label}</label>
                    </div>
                })}
            </div>
        </div>
    </div>
}

export class Filter extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filters: props.filters ? props.filters : []
        }

        this.handleChange = this.handleChange.bind(this);
    }

    // from fo uncheck via toolbar filter checked
    handleChange = (e, from=false) => {
        const { filters } = this.state;

        let value = parseInt(e.currentTarget.value);
        let newFilter;
        if(!from){
            newFilter = (e.currentTarget.checked) ? [...filters, ...[value]] : filters.filter(v => v !== value)
        }else{
            newFilter = filters.filter(v => v !== value)
            document.getElementById(e.currentTarget.dataset.id).click();
        }

        this.setState({filters: newFilter});

        this.props.onGetFilters(newFilter);
    }

    render () {
        return <FilterComponent {...this.props} {...this.state} onChange={this.handleChange} />
    }
}

export class FilterMultiple extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filtersOne: props.filters[0],
            filtersTwo: props.filters[1],
        }

        this.handleFilter = this.handleFilter.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleFilter = (type, value) => {
        const { filtersOne, filtersTwo } = this.state;

        let nFiltersOne = filtersOne;
        let nFiltersTwo = filtersTwo;

        value = parseInt(value);

        switch (type){
            case "filtersTwo":
                nFiltersTwo = updateTab(filtersTwo, value, nFiltersTwo);
                break;
            default:
                nFiltersOne = updateTab(filtersOne, value, nFiltersOne);
                break;
        }

        this.setState({ filtersOne: nFiltersOne, filtersTwo: nFiltersTwo });
        this.props.onGetFilters([nFiltersOne, nFiltersTwo])
    }

    handleChange = (e) => { this.handleFilter(e.currentTarget.name, e.currentTarget.value); }

    handleChangeSelect = (name, e) => {
        this.handleFilter(name, e !== undefined ? e.value : "");
    }

    render () {
        const { itemsOne, titleOne, iconOne, widthOne, classesOne,
            itemsTwo, titleTwo, iconTwo, widthTwo, classesTwo } = this.props;

        const { filtersOne, filtersTwo } = this.state;

        return <>
            <FilterComponent type="multiple" typeFilter="filtersOne" items={itemsOne} filters={filtersOne} onChange={this.handleChange}
                             title={titleOne} icon={iconOne} width={widthOne} classes={classesOne} />
            <FilterComponent type="multiple" typeFilter="filtersTwo" items={itemsTwo} filters={filtersTwo} onChange={this.handleChange}
                             title={titleTwo} icon={iconTwo} width={widthTwo} classes={classesTwo} />
        </>
    }
}

export class FilterSelected extends Component {
    render () {
        const { filters, items, itemsFiltersLabel, itemsFiltersId, onChange } = this.props;

        return <div className="filters-items-checked">
            {filters && filters.map(el => {

                let id = itemsFiltersId ? itemsFiltersId[el] : "";
                let label = itemsFiltersLabel ? itemsFiltersLabel[el] : "";

                if(items){
                    items.forEach(item => {
                        if(item.value === el){
                            id = item.id; label = item.label;
                        }
                    })
                }

                return <div className="item" key={el}>
                    <div className="badge badge-selected">
                        <input type="checkbox" name="filters-checked" id={`fcheck-${el}`} data-id={id} value={el} onChange={onChange}/>
                        <label htmlFor={`fcheck-${el}`}>
                            {label}
                            <span className="icon-cancel" />
                        </label>
                    </div>
                </div>
            })}
        </div>
    }
}

function updateTab(initTable, value, newTable) {
    let find = false;
    initTable.forEach(el => {
        if(el === value){
            find = true;
        }
    })

    if(find){
        newTable = initTable.filter(el => { return el !== value });
    }else{
        newTable.push(value);
    }

    return newTable;
}