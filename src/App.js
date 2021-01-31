import React, { useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, Card } from '@material-ui/core';
import InfoBox from './Infobox';
import Map from './Map';
import './App.css';
import { CardContent } from '@material-ui/core';
import Table from './Table';
import {sortData, prettyPrintStat} from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide'); 
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter]= useState({ lat: 20.5937, lng: 78.9629});
  const [mapZoom, setMapZoom] = useState(2);
  const [mapCountries, setMapCountries]= useState([]);
  const [casesType, setCasesType] = useState('cases');

  // STATE= how to write a variable in React<<<<
  // UseEffect = Runs a piece of code based on a given codition

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  },[]);

  useEffect(() =>{
    const getCountriesData= async () => {
      await fetch ('https://disease.sh/v3/covid-19/countries')
      .then(response => response.json())
      .then(data => {
        const countries = data.map((country)=> ({
          name: country.country,
          value: country.countryInfo.iso2,
        }));
        let sortedData = sortData(data);
        setTableData(sortedData);
        setCountries(countries);
        setMapCountries(data);
      });
  };
  getCountriesData();
},[])

const onCountryChange = async (event) => {
  const countryCode = event.target.value;
  setCountry(countryCode);

  const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

  await fetch(url)
  .then(response => response.json())
  .then ((data) => {
     setCountry(countryCode);
     setCountryInfo(data);
     setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
     setMapZoom(4);
  });
}
 
  return (
    <div className="app">
      <div className='app__left'>
        <div className='app__header'>
            <h1>COVID-19 TRACKER!!</h1>
            <FormControl className='app__dropwon'>
              <Select variant='outlined' value={country} onChange={onCountryChange} >

                  <MenuItem value='worldwide'>Worldwide</MenuItem>
                  { countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
        </div>
        <div className='app__stats'>
              <InfoBox
              isRed
              active={casesType === 'cases'}
              onClick ={e => setCasesType('cases')}
              title ='Coronavrus Cases' cases={prettyPrintStat( countryInfo.todayCases)} total={prettyPrintStat (countryInfo.cases)} />

              <InfoBox
              active={casesType === 'recovered'}
              onClick ={e => setCasesType('recovered')}
              title ='Recoverd' cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)} />

              <InfoBox 
              isRed
              active={casesType === 'deaths'}
              onClick ={e => setCasesType('deaths')}
              title ='Death' cases={prettyPrintStat (countryInfo.todayDeaths)} total={prettyPrintStat (countryInfo.deaths)} />
        </div>

        <Map 
        casesType ={casesType}
        countries={mapCountries} center={mapCenter} zoom ={mapZoom} /> 
      </div>
      <Card className='app__right'>
          <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className='app__graphTitle'>Worldwide new {casesType} </h3>
            <LineGraph className='app__graph' casesType={casesType} />
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
