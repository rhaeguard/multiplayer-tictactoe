import { render, screen } from '@testing-library/react';
import { TicTacToeButton } from './TicTacToeButton';

describe('TicTacToeButton', () => {

    it('renders x correctly', () => {
        render(<TicTacToeButton playerSymbol='x' notify={() => {}} />)
        const button = screen.getByRole('board-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("x");
    })

    it('renders o correctly', () => {
        render(<TicTacToeButton playerSymbol='o' notify={() => {}} />)
        const button = screen.getByRole('board-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("o");
    })


    it('renders empty correctly', () => {
        render(<TicTacToeButton playerSymbol=' ' notify={() => {}} />)
        const button = screen.getByRole('board-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent("");
    })

})