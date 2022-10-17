import { render, screen } from '@testing-library/react';
import { BoardContainer } from './BoardContainer';

describe('BoardContainer', () => {

    it('renders the board correctly', () => {
        const fields = [
            "x", "", "o",
            "", "", "x",
            "o", "o", "x"
        ]

        render(<BoardContainer fields={fields} onClickCell={(index) => {}}/>);

        expect(screen.getByRole('board-wrapper')).toBeInTheDocument();
        expect(screen.getByRole('board')).toBeInTheDocument();

        const rows = screen.getAllByRole('board-row');
        expect(rows).toHaveLength(3);

        const buttons  = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        fields.forEach((field, index) => {
            expect(buttons[index]).toHaveTextContent(field)
        });

    })

})