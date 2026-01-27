import React from 'react';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f4f4f4',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: '#333',
      }}>Página em Construção</h1>
      <p style={{
        fontSize: '1.5rem',
        color: '#666',
      }}>Estamos trabalhando para trazer novidades em breve!</p>
      <div style={{
        marginTop: '2rem',
      }}>
        <Link to="/login" style={{
          padding: '1rem 2rem',
          backgroundColor: '#007BFF',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '5px',
        }}>
          Entrar
        </Link>
      </div>
    </div>
  );
}
