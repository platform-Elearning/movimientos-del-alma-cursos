const Footer = () => {
    return (
      <footer style={styles.footer}>
        <p style={styles.text}>© 2024 Mi Sitio Web. Todos los derechos reservados.</p>
      </footer>
    );
  };
  
  const styles = {
    footer: {
      backgroundColor: '#333',
      color: '#fff',
      textAlign: 'center',
      padding: '20px',
      position: 'fixed',
      bottom: '0',
      width: '100%',
    },
    text: {
      margin: '0',
      fontSize: '14px',
    },
  };
  
  export default Footer;