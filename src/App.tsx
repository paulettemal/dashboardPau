import './App.css'
import Grid from '@mui/material/Grid2'
import IndicatorWeather from './components/IndicatorWeather';
import TableWeather from './components/TableWeather';
import ControlWeather from './components/ControlWeather';
import LineChartWeather from './components/LineChartWeather';
import { useEffect, useState } from 'react';
import Item from './interface/item';

interface Indicator {
  title?: String;
  subtitle?: String;
  value?: String;
}

function App() {
  let [indicators, setIndicators] = useState<Indicator[]>([]);
  let [owm, setOWM] = useState(localStorage.getItem("openWeatherMap"));
  const [items, setItems] = useState<Item[]>([]);
  {/* Hook: useEffect */ }
  useEffect(() => {
    const request = async () => {
      let API_KEY = "e415accb839161aa2fbfe4059d0588a2";
      let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Guayaquil&mode=xml&appid=${API_KEY}`);
      let savedTextXML = await response.text();

      
      const parser = new DOMParser();
      const xml = parser.parseFromString(savedTextXML, "application/xml");

      let dataToIndicators: Indicator[] = [];

      let name = xml.getElementsByTagName("name")[0]?.innerHTML || "";
      dataToIndicators.push({ "title": "Location", "subtitle": "City", "value": name });

      let location = xml.getElementsByTagName("location")[1];
      let latitude = location?.getAttribute("latitude") || "";
      dataToIndicators.push({ "title": "Location", "subtitle": "Latitude", "value": latitude });

      let longitude = location?.getAttribute("longitude") || "";
      dataToIndicators.push({ "title": "Location", "subtitle": "Longitude", "value": longitude });

      let altitude = location?.getAttribute("altitude") || "";
      dataToIndicators.push({ "title": "Location", "subtitle": "Altitude", "value": altitude });

      setIndicators(dataToIndicators);

      
      const times = xml.getElementsByTagName("time");
      let dataToItems: Item[] = [];
      for (let i = 0; i < times.length && dataToItems.length < 6; i++) {
        const time = times[i];
        const dateStart = time.getAttribute("from") || "";
        const dateEnd = time.getAttribute("to") || "";

        
        const formatTime = (datetime: string) => {
          const date = new Date(datetime);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const precipitation = time.getElementsByTagName("precipitation")[0]?.getAttribute("probability") || "";
        const humidity = time.getElementsByTagName("humidity")[0]?.getAttribute("value") || "";

        
        const clouds = time.getElementsByTagName("clouds")[0]?.getAttribute("all") || "";

        dataToItems.push({
          dateStart: formatTime(dateStart),
          dateEnd: formatTime(dateEnd),
          precipitation,
          humidity,
          clouds,
        });
      }
      setItems(dataToItems);
    };

    request();
  }, []);

  const renderIndicators = () => {
    return indicators.map((indicator, idx) => (
      <Grid key={idx} size={{ xs: 12, xl: 3 }}>
        <IndicatorWeather
          title={indicator["title"]}
          subtitle={indicator["subtitle"]}
          value={indicator["value"]}
        />
      </Grid>
    ));
  };

  return (
    <Grid container spacing={5}>
    {renderIndicators()}
      {/* Tabla y control del clima */}
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} md={4}>
          <ControlWeather />
        </Grid>
        <Grid item xs={12} md={8}>
          <TableWeather itemsIn={items} />
        </Grid>
      </Grid>
  
      {/* Gráfico */}
      <Grid size={{ xs: 12, xl: 4 }}>
        <LineChartWeather />
      </Grid>

    </Grid>
  );
}

export default App;