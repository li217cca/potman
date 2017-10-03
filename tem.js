const a = {
    type: "battle_script",
    content: {
        special_count: {
            "3": {
                hook: [
                    {
                        type: "hook_boss_hp",
                        less: 0,
                        methods: [
                            {
                                type: "unlock"
                            },
                            {
                                type: "toResult"
                            }
                        ]
                    }
                ],
                auto_skill: [
                    11, 12
                ],
                charge_attack: true
            }
        },
        lock: true,
        auto_next: true,
        auto_attack: true,
        charge_attack: false
    }
}
// special_count >> hook >> auto_skill >> charge_attack >> auto_attack >> auto_next

const b = {
    type: "deck_script",
    content: {
        perfer_summon: ["カグヤ", "ホワイトラビット"],
        deck_id: 31,
    }
}