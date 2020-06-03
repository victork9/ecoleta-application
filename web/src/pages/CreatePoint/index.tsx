import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import api from '../../services/api'
import Axios from 'axios'
import logo from '../../assets/logo.svg'
import './styles.css'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useHistory } from "react-router-dom";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}
interface IBGECYTIResponse {
    nome: string;
}



const Point = () => {
    const history = useHistory()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })
    const [items, setItems] = useState<Item[]>([])
    const [Ufs, setUfs] = useState<string[]>([])
    const [Cyti, setCyti] = useState<string[]>([])
    const [selectedUf, setSelectedUf] = useState('0')
    const [selectedCyti, setSelectedCyti] = useState('0')
    const [selectPosition, setSelectPosition] = useState<[number, number]>([0, 0])
    const [PositionInitial, setPositionInitial] = useState<[number, number]>([0, 0])
    const [selectedItems, setSelectedItems] = useState<number[]>([])

    useEffect(() => {
        navigator.geolocation.watchPosition(({ coords }) => {
            setPositionInitial([
                coords.latitude,
                coords.longitude
            ])
        })
        api.get('items').then(response => {

            setItems(response.data)
        })

    }, [])

    useEffect(() => {
        Axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla)
            setUfs(ufInitials)
        })
    }, [])

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }
        Axios.get<IBGECYTIResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const citiesInitial = response.data.map(cities => cities.nome)
                setCyti(citiesInitial);
            })

    }, [selectedUf])

    function changeSelected(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCyti("0")
        const uf = event.target.value
        setSelectedUf(uf)
    }
    function changeSelectedCyti(event: ChangeEvent<HTMLSelectElement>) {
        const Cyti = event.target.value
        setSelectedCyti(Cyti)
    }
    function ClickMap(event: LeafletMouseEvent) {
        setSelectPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    function sendForm(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target
        setFormData({
            ...formData,
            [name]: value
        })

    }

    function cliclItems(id: number) {
        const itemsCLick = selectedItems.findIndex(item => item === id)

        if (itemsCLick >= 0) {
            const filterId = selectedItems.filter(item => item !== id)
            setSelectedItems(filterId)
        } else {
            setSelectedItems([...selectedItems, id])
        }

    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData
        const uf = selectedUf
        const city = selectedCyti
        const [latitude, longitude] = selectPosition
        const items = selectedItems
        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        }
        await api.post('points', data)
        history.push('/')
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to='/' >
                    <FiArrowLeft />
                Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={sendForm}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={sendForm}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={sendForm}
                            />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map
                        center={PositionInitial}
                        zoom={15}
                        onclick={ClickMap}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select onChange={changeSelected} name="uf" id="uf">
                                <option value="0" >Selecione uma UF</option>
                                {Ufs.map((uf, index) => (
                                    <option
                                        key={index}
                                        value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select onChange={changeSelectedCyti} name="city" id="city">
                                <option value={selectedCyti} >Selecione uma Cidade</option>
                                {Cyti.map((city, index) => (
                                    <option
                                        key={index}
                                        value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} onClick={() => cliclItems(item.id)}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title} </span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>



        </div >
    )
}

export default Point;
