import { useState, useEffect } from 'react';
import { Text, View, TextInput, Button, FlatList, Alert } from 'react-native';
import {initDB, adicionarPessoa, listarPessoas, deletarPessoa} from './database';
import Pessoa from './components/Pessoa';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pessoas, setPessoas] = useState([]); 

    async function carregarPessoas() {
        const dados = await listarPessoas();
        setPessoas(dados);
    }

    const prepararApp = async () => {
        await initDB();
        await carregarPessoas();
    };

    async function handleAdicionar() {
        if (!nome || !email || !password) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }
        await adicionarPessoa(nome, email, password);
        setNome('');
        setEmail('');
        setPassword('');
        await carregarPessoas();
    }

    async function handleDeletar(id) {
        await deletarPessoa(id);
        await carregarPessoas();
    }

    useEffect(() => {
        prepararApp();
    }, []);

      return (
    <SafeAreaProvider>
      <SafeAreaView>
        <Text>
          Cadastro de Pessoas (SQLite)
        </Text>

        <View>
          <TextInput
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Adicionar" onPress={handleAdicionar} />
        </View>

        <FlatList
          data={pessoas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pessoa 
                id={item.id} 
                nome={item.nome} 
                email={item.email} 
                password={item.password} 
                onDelete={handleDeletar} 
            />
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
