import React from 'react';
import './App.css';

import RecommendedProductsList from './components/RecommendedProductsList';

const App: React.FC = () => {
	return (
		<div className="App">
			<RecommendedProductsList />
		</div>
	);
}

export default App;
