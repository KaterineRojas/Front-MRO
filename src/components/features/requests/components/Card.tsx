

import { Check, Clock, XCircle } from 'lucide-react';

import { useSelector } from 'react-redux';


interface cardProps {
    title: string,
    iconType: string,
    value: number
    description: string,
    mainColor: string
}


function Card({ title, iconType, description, value, mainColor }: cardProps) {

    const darkMode = useSelector((state: any) => state.ui.darkMode);

    const selectIconType = () => {
        switch (iconType) {
            case 'clock':
                return <Clock className="h-4 w-4 text-orange-600" />
            case 'check':
                return <Check className="h-4 w-4 text-green-600" />
            case 'xCircle':
                return <XCircle className="h-4 w-4 text-red-600" />
            default:
                break;
        }
    }

    /**
     * red #FB2C36
     * rose #FF2056
     * violet #8E51FF
     * yellow #F0B100
     */

    const selectMainColorClass = () => {
        switch (mainColor) {
            case 'blue':
                return '#1447E6';
            case 'green':
                return '#5EA500';
            case 'orange':
                return '#FF6900';
            case 'red':
                return '#FB2C36';
            case 'rose':
                return '#FF2056';
            case 'violet':
                return '#8E51FF';
            case 'yellow':
                return '#F0B100';
            default:
                return '#E5E5E5';
        }
    }


    return (
        <div
            className={` flex flex-col gap-6 rounded-xl border `}
            style={{
                backgroundColor: `${darkMode ? selectMainColorClass() + '20' : 'transparent'}`,
                border: `solid 2px ${selectMainColorClass()}`
            }}
        >
            <div className="auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className='text-m'>{title}</h3>
                {selectIconType()}
            </div>

            <div className="px-6 [&:last-child]:pb-6">
                <div className="text-2xl text-green-600"
                    style={{ color: `${selectMainColorClass()}` }}
                >{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
        </div>
    )
}

export default Card


{/* <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Pending</CardTitle>
        
    </CardHeader>
    <CardContent>
        <div className="text-2xl text-orange-600">{pendingCount}</div>
        <p className="text-xs text-muted-foreground">Need review</p>
    </CardContent>
</Card> */}


