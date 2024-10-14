
import { StyleSheet, Text, View, TextInput, Button, FlatList  } from 'react-native';
import {app} from './FirebaseConfig';
import { getDatabase, ref, push, onValue, remove, set } from "firebase/database";
import React, { useState, useEffect} from 'react';
import { Alert } from 'react-native';



export default function App() {
  const [products, setProducts] = useState({
    product: '',
    amount: ''
  }); //tallentaa tuotteen ja määrän
  const [items, setItems] = useState([]); //tallentaa ostoslistan kaikki tuotteet taulukoksi

    const database = getDatabase(app); //tietokanta "kahva" jolla pääsee käsiksi tietokantaan

    const handleSave = () => {
      if (products.amount && products.product) { //tarkisetaan onko tuotteen nimi ja määrä syötetty
        const newProductRef = push(ref(database, 'items/')); // luodaan viittaus (ref) tietokannan items-kokoelmaan ja käytetään push-metodia, joka luo uuden yksilöivän avaimen (key).
        const newProduct = { ...products, id: newProductRef.key }; //luodaan uusi objekti nimeltä newProduct, joka sisältää kaikki products-objektin tiedot ja lisää uuden kentän id, joka saa arvokseen juuri luodun yksilöivän avaimen (newProductRef.key).
        set(newProductRef, newProduct) // tallennetaan tuote tietokantaan
          .then(() => {
            console.log("Product added successfully");
          })
          .catch((error) => {
            console.error("Error adding product: ", error);
          });
      } else {
        Alert.alert('Error', 'Type product and amount first');
      }
    };
    
    
    useEffect(() => { //onValue on kuuntelija
      const itemsRef = ref(database, 'items/');
      onValue(itemsRef, (snapshot) => { //snapshot on olio, jonka avulla päästään käsiksi kokoelman items sisältöön
        const data = snapshot.val(); //palauttaa pyydetyn sisällön javascript oliona
        if (data) {
          setItems(Object.values(data));//object.values antaa arvot taulukkona
        } else {
          setItems([]); // Handle the case when there are no items
        }
      })
    }, []);


    const handleDelete = (id) => {
      const itemRef = ref(database, `items/${id}`); // Muutetaan viittaus oikeaan objektiin, viittuas objektiin on tekoälyltä
      remove(itemRef)
        .then(() => {
          console.log("Item removed successfully");
        })
        .catch((error) => {
          console.error("Error removing item: ", error);
        });
    };
    

  return (
    <View style={styles.container}>
      <TextInput 
      placeholder='Product' 
      onChangeText={text => setProducts({...products, product: text})}
      value={products.product}/>  
    <TextInput 
      placeholder='Amount' 
      onChangeText={text => setProducts({...products, amount: text})}
      value={products.amount}/>   
       
    <Button onPress={handleSave} title="Save" />
    <TextInput>Shopping list</TextInput> 
    <FlatList 
    keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}//tämä on tekoälyltä:
    //Tämä käyttää ternääristä ehtolauseketta. Se tarkistaa, onko item.id määritelty (eli onko se olemassa ja ei-tyhjä).
      //Jos item.id on olemassa (totuusarvo), käytetään item.id-arvoa.
      //Jos item.id ei ole olemassa (epätosi), käytetään satunnaista arvoa.
      //item.id.toString():
      //Jos item.id on olemassa, se muutetaan merkkijonoksi toString()-metodilla. Tämä on tarpeen, koska keyExtractor-avaimen on oltava merkkijono, ja id voi olla alkuperäisesti esimerkiksi numero.
      //Math.random().toString():
      //Jos item.id ei ole olemassa, luodaan uusi satunnainen arvo Math.random()-metodilla, joka tuottaa satunnaisen numeron välillä 0–1. Tämän jälkeen se muutetaan myös merkkijonoksi toString()-metodilla.

  renderItem={({item}) => 
    <View style={styles.listContainer}>
      <Text style={{fontSize: 18}}>{item.product}, {item.amount}</Text>
      <Text style={{ color: '#0000ff' }} onPress={() => handleDelete(item.id)}>delete</Text>
    </View>} 
  data={items} />      
      
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 70
  },
});