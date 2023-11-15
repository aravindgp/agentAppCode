import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {COLORS, IMGS, ROUTES} from '../../constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {PropertyId} from '../../../store';
import {UserToken} from '../../../store';
import axios from 'axios';
import NoImage from '../../assets/nophotoavaliable.jpeg';
import {API_URL} from '@env';

const Tasks = ({navigation}) => {
  const [items, setItems] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);
  const {userToken} = UserToken.useState(s => s);
  console.log(userToken);

  useEffect(() => {
    async function fetchTrackApiData() {
      console.log(`Bearer ${userToken}`);
      try {
        const response = await axios.get(`${API_URL}/user/get-tasks`, {
          headers: {
            Authorization: 'Bearer ' + userToken,
          },
        });

        await console.log(response.data.tasks);

        // setItems(response.data.tasks)
        const uniqueProperties = response.data.tasks.reduce(
          (accumulator, item) => {
            if (!accumulator.includes(item.property_id)) {
              accumulator.push(item.property_id);
            }
            return accumulator;
          },
          [],
        );

        const uniquePropertyObjects = uniqueProperties.map(propertyId => {
          const propertyObject = response.data.tasks.find(
            item => item.property_id === propertyId,
          ).property;
          return {
            property_id: propertyId,
            ...propertyObject,
          };
        });
        // console.warn(uniquePropertyObjects.length)
        setItems(uniquePropertyObjects);
      } catch (error) {
        await console.warn(error);
        // window.alert("Can't Assign Same Track Name")
      }
    }
    fetchTrackApiData();
  }, [1]);

  const [gridView, setgridView] = useState(false);

  const filteredItems = items.filter(item =>
    item.property_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function openSingleTask(id) {
    PropertyId.update(s => {
      s.propertyId = id;
    });
    navigation.navigate(ROUTES.TASKS_DETAIL);
  }

  const renderItem = ({item}) =>
    gridView ? (
      <TouchableOpacity
        style={styles.card}
        onPress={() => openSingleTask(item.property_id)}>
        <View>
          <Image
            style={styles.image}
            source={ item?.images[0] ? {uri: `${API_URL}/${item?.images[0]}`,} : NoImage }
          />

          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              marginVertical: 5,
            }}>
            {/* <Text style={styles.propertyId}>{item.property_id}</Text> */}
            <Text style={styles.propertyId}>{item.property_name}</Text>
          </View>
          <View
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              marginVertical: 5,
            }}>
            <Text style={styles.area}>{item.area} sq. yd</Text>
            {/* <Text style={styles.area}>{new Date(item.created_at).toLocaleDateString()}</Text> */}
          </View>
          <Text style={styles.propertyloaction}>{item.address}</Text>
        </View>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.list}
        onPress={() => openSingleTask(item.property_id)}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginVertical: 5,
          }}>
          <View>
            <Image
              style={styles.tinyLogo}
              source={ item?.images[0] ? {uri: `${API_URL}/${item?.images[0]}`} : NoImage }
            />
          </View>
          <View>
            <Text style={{...styles.propertyId, marginRight: 10}}>
              {item.property_name}
            </Text>
            <Text style={{color: COLORS.black}}>{item.area} sq. yd</Text>
          </View>

          {/* <View style={{marginRight:10}}>
     
        <Text >{item.area} sq. yd</Text>
        </View> */}
          <View>
            {/* <Text >
      
        {item.address}

      </Text> */}
          </View>
        </View>
      </TouchableOpacity>
    );

  return (
    <View style={{...styles.maincontainer}}>
      <View
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'row',
          width: '100%',
          alignItems: 'center',
        }}>
        <View style={{width: '70%'}}>
          <TextInput
            style={styles.textInputStyle}
            underlineColorAndroid="transparent"
            placeholder="  Search"
            placeholderTextColor={COLORS.primary}
            onChangeText={text => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={{marginRight: 10}}>
            {gridView ? (
              <TouchableOpacity>
                <MaterialIcon name="view-grid" size={30} color={COLORS.dark} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setgridView(true)}>
                <MaterialIcon
                  name="view-grid-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </Text>

          <Text style={{marginRight: 10}}>
            {!gridView ? (
              <TouchableOpacity>
                <Ionicons
                  name="list-circle-sharp"
                  size={40}
                  color={COLORS.dark}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setgridView(false)}>
                <Ionicons
                  name="list-circle-outline"
                  size={40}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            )}
          </Text>
        </View>
      </View>
      {/* 
      <View style={styles.container}>
      {
        gridView ?
        <FlatList  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        key="grid"
        data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
        />
        :
        <FlatList  refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        key="list"
        data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={1}
        />
      }
        
      </View> */}
      <View style={styles.container}>
        {filteredItems.length > 0 ? (
          <FlatList
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            key={gridView ? 'grid' : 'list'}
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={gridView ? 2 : 1}
            style={{marginBottom:100}}
          />
        ) : (
          <Text style={{color: COLORS.black}}>No Properties found</Text>
        )}
      </View>
    </View>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  flexStyle: {
    display: 'flex',
    alignItems: 'center',
  },
  maincontainer: {
    padding: 20,
    backgroundColor: '#fff',
    height: '100%',
  },

  tinyLogo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  heading: {
    textAlign: 'center',
    fontSize: 30,
  },
  textInputStyle: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'white',
    backgroundColor: '#f2f2f2',
    color: COLORS.primary,
  },
  container: {
    paddingTop: 10,
    height: '100%',
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 14,
  },
  image: {
    width: 100,
    height: 100,
  },
  propertyId: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    color: COLORS.black,
  },
  area: {
    fontSize: 12,
    textAlign: 'center',
    color: COLORS.black,
  },
  propertyloaction: {
    fontSize: 14,
    fontWeight: 'bold',
    width: '100%',
    color: COLORS.black,
  },

  list: {
    backgroundColor: '#f2f2f2',
    margin: 5,
    padding: 10,
    width: '100%',
  },
  listimage: {
    width: 50,
    height: 50,
    margin: 5,
  },
});
