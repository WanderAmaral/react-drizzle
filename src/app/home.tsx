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
import { eq, like } from "drizzle-orm";

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
      const response = await db.query.product.findMany({
        where: like(productSchema.product.name, `%${search}%`),
      });

      setData(response);
    } catch (error) {
      console.log(error);
    }
  }

  async function setProducts() {
    try {
      const response = await db.insert(productSchema.product).values({ name });

      Alert.alert(`Cadastrado com o ID: ${response.lastInsertRowId}`);
      setName("");
      await fetchProducts();
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteProduct(id: number) {
    try {
      Alert.alert("Remove", "Deseja remover?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "sim",
          onPress: async () => {
            await db
              .delete(productSchema.product)
              .where(eq(productSchema.product.id, id));

            await fetchProducts();
          },
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  }

  async function showProduct(id: number) {
    try {
      const product = await db.query.product.findFirst({
        where: eq(productSchema.product.id, id),
      });

      if (product) {
        Alert.alert(
          `Produto ID: ${product.id} cadastrado com o nome ${product.name}`
        );
      }
    } catch (error) {
      console.log(error);
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
          <Pressable
          onPress={() => showProduct(item.id)}
            onLongPress={() => deleteProduct(item.id)}
            style={{ padding: 16, borderWidth: 1, borderRadius: 7 }}
          >
            <Text>{item.name}</Text>
          </Pressable>
        )}
        ListHeaderComponent={() => <Text>Produtos</Text>}
        ListEmptyComponent={() => <Text>Lista vazia</Text>}
        contentContainerStyle={{ gap: 16 }}
      />
    </View>
  );
}
