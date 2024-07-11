import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import * as productSchema from "../database/schemas/productSchema";
import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  Pressable,
  Text,
  Alert,
} from "react-native";
import { like } from "drizzle-orm";

type Data = {
  id: number;
  name: string;
};

export default function Home() {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Data[]>([]);

  const database = useSQLiteContext();
  const db = drizzle(database, { schema: productSchema });

  async function fetchProducts() {
    try {
      const response = await db.query.product.findMany({ where: like(productSchema.product.name, `%${search}%`)});
      
      setData(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function setProducts() {
    try {
      const response = await db.insert(productSchema.product).values({ name });

      Alert.alert(`Casdrado com o ID: ${response.lastInsertRowId}`);
      setName("");
      await fetchProducts();
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteProduct(id: string) {
    try {
      
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return (
    <View style={{ flex: 1, padding: 32, gap: 16 }}>
      <TextInput
        placeholder="Nome"
        style={{
          height: 54,
          borderWidth: 1,
          borderRadius: 7,
          borderColor: "#999",
          paddingHorizontal: 16,
        }}
        onChangeText={setName}
        value={name}
      />

      <Button title="Salvar" onPress={setProducts} />

      <TextInput
        placeholder="Pesquisar..."
        style={{
          height: 54,
          borderWidth: 1,
          borderRadius: 7,
          borderColor: "#999",
          paddingHorizontal: 16,
        }}
        onChangeText={setSearch}
        value={search}
      />
      
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Pressable style={{ padding: 16, borderWidth: 1, borderRadius: 7 }}>
            <Text>{item.name}</Text>
          </Pressable>
        )}
        ListHeaderComponent={() => <Text>Produtos</Text>}
        ListEmptyComponent={() => <Text>Lista vazia</Text>}
        contentContainerStyle={{gap: 16}}
      />
    </View>
  );
}
