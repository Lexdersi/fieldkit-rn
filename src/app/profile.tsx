import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/Avatar';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FieldKit User Profile</Text>
      
      {/* Verified circular avatar component */}
      <Avatar 
        uri="https://images.unsplash.com/photo-1534528741775-53994a69daeb" 
        size={80} 
      />
      
      <Text style={styles.name}>Alex Morgan</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  name: { color: '#888', fontSize: 16, marginTop: 12 },
});