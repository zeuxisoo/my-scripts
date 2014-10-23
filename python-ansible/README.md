# Ansible Notes

Call shell module to execute multi commands with su write and display all logs

    ansible hand -i ./hosts -m shell -a "apt-get update && apt-get upgrade -y" --su --su-user=root --ask-su-pass -vvvvv
