import { View, Text, TouchableOpacity } from 'react-native';

export default function Pessoa({ id, nome, email, password, onDelete }) {
    return (
        <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <View>
                <Text style={{ fontSize: 18 }}>{nome}</Text>
                <Text style={{ color: '#555' }}>{email}</Text>
                <Text style={{ color: '#555' }}>{password}</Text>
            </View>
            <TouchableOpacity onPress={() => onDelete(id)} style={{ marginTop: 5 }}>
                <Text style={{ color: 'red' }}>Deletar</Text>
            </TouchableOpacity>
        </View>
    );
}