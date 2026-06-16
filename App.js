import React, { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
// tela atual
const [screen, setScreen] = useState('home');

// usuário logado
const [user, setUser] = useState(null);

// campos do formulário
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');

// usuários cadastrados
const [pessoas, setPessoas] = useState([]);

// mensagem exibida na tela
const [message, setMessage] = useState('');

// banco de dados
const dbRef = useRef({
  initDB: async () => {},
  adicionarPessoa: async () => {},
  listarPessoas: async () => [],
  deletarPessoa: async () => {},
});

  // inicia o banco quando abrir o app
  useEffect(() => {
    async function iniciarApp() {
      if (Platform.OS === 'web') {
        // salva os dados no navegador
        let store = [];
        const load = () => {
          try {
            const raw = localStorage.getItem('pessoas_db');
            store = raw ? JSON.parse(raw) : [];
          } catch (e) {
            store = [];
          }
        };
        const persist = () => {
          try { localStorage.setItem('pessoas_db', JSON.stringify(store)); } catch (e) {}
        };

        dbRef.current.initDB = async () => { load(); };
        dbRef.current.adicionarPessoa = async (nome, email, password) => {
          const id = store.length ? Math.max(...store.map(p => p.id)) + 1 : 1;
          store.push({ id, nome, email, password });
          persist();
        };
        dbRef.current.listarPessoas = async () => store.slice();
        dbRef.current.deletarPessoa = async (id) => { store = store.filter(p => p.id !== id); persist(); };
      } else {
        // importa o database.js apenas em ambiente nativo
        const mod = await import('./database');
        dbRef.current.initDB = mod.initDB;
        dbRef.current.adicionarPessoa = mod.adicionarPessoa;
        dbRef.current.listarPessoas = mod.listarPessoas;
        dbRef.current.deletarPessoa = mod.deletarPessoa;
      }

      await dbRef.current.initDB();
      await refreshPessoas();
    }
    iniciarApp();
  }, []);

  // atualiza a lista de usuários
  async function refreshPessoas() {
    const all = await dbRef.current.listarPessoas();
    setPessoas(all || []);
  }

  // mostra mensagem na tela
  function showMessage(text) {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  }

  // cadastro usando adicionarPessoa(nome, email, password)
  async function handleRegister() {
    if (!name || !email || !password) {
      showMessage('Preencha todos os campos');
      return;
    }

    // vê se o email já está cadastrado
    const all = await dbRef.current.listarPessoas();
    if (all.some(p => p.email === email)) {
      showMessage('Email já cadastrado');
      return;
    }

    await dbRef.current.adicionarPessoa(name, email, password);
    setName(''); setEmail(''); setPassword('');
    showMessage('Cadastro concluído!');
    await refreshPessoas();
    setScreen('login');
  }

  // verifica email e senha
  async function handleLogin() {
    if (!email || !password) {
      showMessage('Preencha email e senha');
      return;
    }

    const all = await dbRef.current.listarPessoas();
    const usuario = all.find(p => p.email === email && p.password === password);
    if (!usuario) {
      showMessage('Email ou senha incorretos');
      return;
    }

    setUser(usuario);
    setEmail(''); setPassword('');
    showMessage('Bem-vindo!');
    setScreen('dashboard');
  }

  // logout
  function handleLogout() {
    setUser(null);
    setScreen('home');
    showMessage('Você saiu da conta');
  }

  // deletar pessoa
  async function handleDelete(id) {
    await dbRef.current.deletarPessoa(id);
    await refreshPessoas();
    showMessage('Usuário removido');
  }

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>AirH²O</Text>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => setScreen('home')} style={styles.navButton}><Text style={styles.navText}>Início</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('dashboard')} style={styles.navButton}><Text style={styles.navText}>Painel</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setScreen('profile')} style={styles.navButton}><Text style={styles.navText}>Minha Conta</Text></TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {message ? <View style={styles.alert}><Text style={styles.alertText}>{message}</Text></View> : null}

        {screen === 'home' && (
          <View>
            <Text style={styles.title}>Bem-vindo ao AirH²O</Text>
            <Text style={styles.p}>Projeto desenvolvido para acompanhar o reaproveitamento da água dos aparelhos de ar-condicionado.
</Text>
            <View style={{flexDirection:'row', marginTop:12}}>
              <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => setScreen('register')}><Text style={styles.btnTextPrimary}>Cadastrar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => setScreen('login')}><Text style={styles.btnTextOutline}>Entrar</Text></TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'register' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Cadastro</Text>
            <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#999" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleRegister}><Text style={styles.btnTextPrimary}>Cadastrar</Text></TouchableOpacity>
          </View>
        )}

        {screen === 'login' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Login</Text>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#999" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#999" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleLogin}><Text style={styles.btnTextPrimary}>Entrar</Text></TouchableOpacity>
          </View>
        )}

        {screen === 'dashboard' && (
          <View>
            <Text style={styles.sectionTitle}>Painel</Text>
            <Text style={styles.p}>Usuários cadastrados no sistema.</Text>
            {pessoas.map(p => (
              <View key={String(p.id)} style={styles.personRow}>
                <View>
                  <Text style={styles.personName}>{p.nome}</Text>
                  <Text style={styles.personEmail}>{p.email}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(p.id)}><Text style={styles.deleteText}>Remover</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {screen === 'profile' && (
          <View>
            <Text style={styles.sectionTitle}>Minha Conta</Text>
            <View style={styles.formCard}>
              <Text>Nome: {user?.nome}</Text>
              <Text>Email: {user?.email}</Text>
              <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={handleLogout}><Text style={styles.btnTextDanger}>Sair</Text></TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1,
    backgroundColor: '#0f1419' 
    },

  header: { 
    backgroundColor: '#27ae60',
    padding: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
    },

  logo: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700' 
    },

  navRow: { 
    flexDirection: 'row' 
    },

  navButton: { 
    marginLeft: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderRadius: 16 
    },

  navText: { 
    color: '#fff', 
    fontSize: 12
    },

  scroll: { 
    padding: 16, 
    paddingBottom: 40 
    },

  title: { 
    color: '#2ecc71', 
    fontSize: 28, 
    fontWeight: '800' 
    },

  p: { 
    color: '#bdc3c7', 
    marginTop: 8 
    },

  btn: { 
    borderRadius: 20, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    marginRight: 10, 
    marginTop: 6 
    },

  btnPrimary: { 
    backgroundColor: '#2ecc71' 
    },

  btnOutline: { 
    borderWidth: 1, 
    borderColor: '#fff', 
    backgroundColor: 'transparent' 
    },

  btnTextPrimary: { 
    color: '#0f1419', 
    fontWeight: '700' 
    },

  btnTextOutline: { 
    color: '#ecf0f1', 
    fontWeight: '700' 
    },

  alert: { 
    padding: 10, 
    borderRadius: 10, 
    backgroundColor: 'rgba(46,204,113,0.12)', 
    marginBottom: 12 
    },

  alertText: { 
    color: '#ecf0f1' 
    },

  formCard: { 
    backgroundColor: '#1a2332', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 14 
    },

  formTitle: { 
    color: '#ecf0f1', 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 10 
    },

  input: { 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: '#0f1419', 
    color: '#ecf0f1', 
    borderWidth: 1, 
    borderColor: '#2c3e50', 
    paddingHorizontal: 10, 
    marginBottom: 10 
    },

  sectionTitle: { 
    color: '#2ecc71', 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 12 
    },

  personRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#1a2332', 
    padding: 10, 
    borderRadius: 8, 
    marginBottom: 8 
    },

  personName: { 
    color: '#ecf0f1', 
    fontWeight: '700' 
    },

  personEmail: { 
    color: '#bdc3c7', 
    fontSize: 12 
    },

  deleteBtn: { 
    backgroundColor: '#e74c3c', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 8 
    },

  deleteText: { 
    color: '#fff', 
    fontWeight: '700' 
    },

  btnDanger: { 
    backgroundColor: '#e74c3c', 
    marginTop: 12 
    },

  btnTextDanger: { 
    color: '#fff', 
    fontWeight: '700' 
    }
});