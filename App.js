
import { StyleSheet, Text, View, TextInput, Button, FlatList  } from 'react-native';
import {app} from './FirebaseConfig';
import { getDatabase, ref, push, onValue, remove } from "firebase/database";
import React, { useState, useEffect} from 'react';
import { Alert } from 'react-native';



export default function App() {
  const [products, setProducts] = useState({
    product: '',
    amount: ''
  });
  const [items, setItems] = useState([]);

    const database = getDatabase(app); //tietokanta "kahva" jolla pääsee käsiksi tietokantaan

    const handleSave = () => {
      if (products.amount && products.product) {
        const newProductRef = push(ref(database, 'items/'));
        const newProduct = { ...products, id: newProductRef.key }; // Lisää id
        newProductRef.set(newProduct);
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
      const itemRef = ref(database, `items/${id}`); 
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
       <TextInput>Shopping list</TextInput>
    <Button onPress={handleSave} title="Save" /> 
    <FlatList 
    keyExtractor={item => item.id.toString()}
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