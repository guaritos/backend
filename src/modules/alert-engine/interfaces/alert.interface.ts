export interface Alert {
    id?: string;
    rule_id: string;
    result: any;
    data: any;
    actions_fired: any;
    message?: string;
    status: 'pending' | 'resolved' | 'dismissed';
}